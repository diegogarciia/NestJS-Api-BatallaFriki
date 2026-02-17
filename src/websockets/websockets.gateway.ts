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

@WebSocketGateway({
  cors: { origin: '*' }, 
})
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly websocketsService: WebsocketsService, 
    private readonly juegoService: JuegoService            
  ) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
    this.websocketsService.removeUser(client.id);
  }

  @SubscribeMessage('realizar-ataque')
  async handleRealizarAtaque(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any
  ) {
    try {
      const payload = typeof data === 'string' ? JSON.parse(data) : data;
      const usuarioId = Number(payload.usuarioId);

      this.websocketsService.addUser(client.id, usuarioId, `Jugador_${usuarioId}`);

      const estadoPartida = await this.juegoService.atacar(usuarioId);

      this.server.emit('estado-batalla', estadoPartida);

      if (estadoPartida.finalizado) {
        this.server.emit('final-batalla', {
          ganador: estadoPartida.ganadorId,
          mensaje: 'La partida ha terminado'
        });
      }

    } catch (error) {
      console.error('Error en ataque:', error.message);
      client.emit('error-ataque', { mensaje: error.message });
    }
  }
}