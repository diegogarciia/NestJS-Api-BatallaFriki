import { Module } from '@nestjs/common';
import { PersonajesBdService } from './personajes-bd.service';
import { PersonajesBdController } from './personajes-bd.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PersonajesBdController],
  providers: [PersonajesBdService],
})
export class PersonajesBdModule {}
