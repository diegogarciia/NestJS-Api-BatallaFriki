import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';
import { WebsocketsService } from './websockets.service';
import { JuegoModule } from '../juego/juego.module'; 

@Module({
  imports: [
    JuegoModule, 
  ],
  providers: [
    WebsocketsGateway, 
    WebsocketsService
  ],
  exports: [WebsocketsService], 
})
export class WebsocketsModule {}