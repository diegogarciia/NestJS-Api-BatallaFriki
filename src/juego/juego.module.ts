import { Module } from '@nestjs/common';
import { JuegoService } from './juego.service';
import { JuegoController } from './juego.controller';

@Module({
  controllers: [JuegoController],
  providers: [JuegoService],
})
export class JuegoModule {}
