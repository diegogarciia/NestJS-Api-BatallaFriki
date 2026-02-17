import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JuegoService } from './juego.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class JuegoGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly juegoService: JuegoService) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  @SubscribeMessage('realizar_ataque')
  async handleAtaque(@ConnectedSocket() client: Socket, payload: { usuarioId: number }) {
    const estadoPartida = await this.juegoService.atacar(payload.usuarioId);

    this.server.emit('estado_batalla', estadoPartida);

    if (estadoPartida.finalizado) {
      this.server.emit('batalla_finalizada', { ganador: estadoPartida.ganadorId });
    }
  }
}