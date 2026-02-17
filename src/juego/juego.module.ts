import { Module } from '@nestjs/common';
import { JuegoService } from './juego.service';
import { JuegoController } from './juego.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JuegoGateway } from './juego.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [JuegoController],
  providers: [JuegoService, JuegoGateway],
})
export class JuegoModule {}
