import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JuegoService } from './juego.service';

@WebSocketGateway({
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class JuegoGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly juegoService: JuegoService) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado al socket: ${client.id}`);
  }

  @SubscribeMessage('realizar_ataque')
  async handleAtaque(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    try {
      let rawData = data;
      if (typeof data === 'string' && data.startsWith('JSON:')) {
        rawData = data.replace('JSON: ', '').trim();
      }

      const payload = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      
      const uid = Number(payload?.usuarioId || payload);

      if (!uid || isNaN(uid)) {
        throw new Error('Formato de usuarioId no válido');
      }

      console.log(`Intentando ataque para el usuario: ${uid}`);

      const estadoPartida = await this.juegoService.atacar(uid);

      console.log(`Ataque exitoso. Vida rival restante: ${estadoPartida.vidaActualRival}`);

      this.server.emit('estado_batalla', estadoPartida);

      if (estadoPartida.finalizado) {
        this.server.emit('final_batalla', {
          ganador: estadoPartida.ganadorId,
          mensaje: estadoPartida.ganadorId === uid ? '¡Victoria!' : 'Derrota'
        });
      }

    } catch (error) {
      console.log('Error en el Socket:', error.message);
      
      client.emit('error_partida', { 
        mensaje: error.message,
        ayuda: 'Recuerda iniciar la partida con un POST a /juego/iniciar antes de atacar'
      });
    }
  }
}