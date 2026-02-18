import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  SubscribeMessage, 
  ConnectedSocket, 
  MessageBody 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketsService } from './websockets.service';
import { JuegoService } from '../juego/juego.service';

interface BatallaActiva {
  roomId: string;
  p1: { id: number; socketId: string; vida: number; vidaMax: number; ataque: number; nombre: string };
  p2: { id: number; socketId: string; vida: number; vidaMax: number; ataque: number; nombre: string };
  turnoId: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  private colaEspera: { client: Socket, usuarioId: number, personajeId: number, nombre: string }[] = [];
  private activeBattles: Map<string, BatallaActiva> = new Map();

  constructor(
    private readonly websocketsService: WebsocketsService, 
    private readonly juegoService: JuegoService            
  ) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.colaEspera = this.colaEspera.filter(p => p.client.id !== client.id);
    this.activeBattles.delete(client.id);
    this.websocketsService.removeUser(client.id);
  }

  @SubscribeMessage('unirse-espera')
  async handleJoinQueue(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    const { usuarioId, personajeId, nombre } = payload;

    if (this.colaEspera.find(p => p.usuarioId === usuarioId)) return;

    this.colaEspera.push({ client, usuarioId, personajeId, nombre });

    if (this.colaEspera.length >= 2) {
      const p1 = this.colaEspera.shift();
      const p2 = this.colaEspera.shift();
      if (!p1 || !p2) return;

      try {
        const char1 = await this.juegoService.obtenerEstadisticasPersonaje(p1.personajeId);
        const char2 = await this.juegoService.obtenerEstadisticasPersonaje(p2.personajeId);

        const roomId = `room_${p1.usuarioId}_${p2.usuarioId}`;
        p1.client.join(roomId);
        p2.client.join(roomId);

        const batalla: BatallaActiva = {
          roomId,
          p1: { 
            id: p1.usuarioId, socketId: p1.client.id, 
            vida: char1.vida, vidaMax: char1.vida, ataque: char1.ataque, 
            nombre: p1.nombre 
          },
          p2: { 
            id: p2.usuarioId, socketId: p2.client.id, 
            vida: char2.vida, vidaMax: char2.vida, ataque: char2.ataque, 
            nombre: p2.nombre 
          },
          turnoId: p1.usuarioId
        };
        
        this.activeBattles.set(p1.client.id, batalla);
        this.activeBattles.set(p2.client.id, batalla);

        this.enviarEstadoPvP(batalla);

      } catch (error) {
        console.error("Error al iniciar batalla PvP:", error);
        p1.client.emit('error-ataque', { mensaje: 'Error al obtener datos del personaje' });
        p2.client.emit('error-ataque', { mensaje: 'Error al obtener datos del personaje' });
      }
    }
  }

  @SubscribeMessage('realizar-ataque')
  async handleRealizarAtaque(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const payload = typeof data === 'string' ? JSON.parse(data.replace('JSON:', '')) : data;
      const usuarioId = Number(payload.usuarioId || payload);

      const batalla = this.activeBattles.get(client.id);

      if (batalla) {
        if (batalla.turnoId !== usuarioId) throw new Error('No es tu turno');
        
        const atacante = batalla.p1.id === usuarioId ? batalla.p1 : batalla.p2;
        const defensor = batalla.p1.id === usuarioId ? batalla.p2 : batalla.p1;

        defensor.vida = Math.max(0, defensor.vida - atacante.ataque);
        batalla.turnoId = defensor.id;

        this.enviarEstadoPvP(batalla);

        if (defensor.vida <= 0) {
          const finMsg = { ganador: atacante.id };
          this.server.to(batalla.roomId).emit('final-batalla', finMsg);
          
          try {
            await this.juegoService.registrarResultadoPvP(atacante.id, defensor.id);
          } catch(e) { console.error("Error guardando stats PvP", e); }

          this.activeBattles.delete(batalla.p1.socketId);
          this.activeBattles.delete(batalla.p2.socketId);
        }
      } else {
        this.websocketsService.addUser(client.id, usuarioId, `Jugador_${usuarioId}`);
        const estado = await this.juegoService.atacar(usuarioId);
        client.emit('estado-batalla', estado);
        
        if (estado.finalizado) {
          client.emit('final-batalla', { ganador: estado.ganadorId });
        }
      }
    } catch (error) { 
      client.emit('error-ataque', { mensaje: error.message }); 
    }
  }

  private enviarEstadoPvP(b: BatallaActiva) {
    const enviar = (socketId: string, isP1: boolean) => {
      this.server.to(socketId).emit('estado-batalla', {
        vidaActualJugador: isP1 ? b.p1.vida : b.p2.vida,
        vidaMaxJugador:    isP1 ? b.p1.vidaMax : b.p2.vidaMax,
        
        vidaActualRival:   isP1 ? b.p2.vida : b.p1.vida,
        vidaMaxRival:      isP1 ? b.p2.vidaMax : b.p1.vidaMax,
        
        ataqueJugador:     isP1 ? b.p1.ataque : b.p2.ataque,
        ataqueRival:       isP1 ? b.p2.ataque : b.p1.ataque,
        
        turnoId: b.turnoId, 
        nombreJugador: isP1 ? b.p1.nombre : b.p2.nombre,
        nombreRival: isP1 ? b.p2.nombre : b.p1.nombre
      });
    };
    enviar(b.p1.socketId, true);
    enviar(b.p2.socketId, false);
  }
}