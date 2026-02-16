import { Module } from '@nestjs/common';
import { PersonajesBdService } from './personajes-bd.service';
import { PersonajesBdController } from './personajes-bd.controller';

@Module({
  controllers: [PersonajesBdController],
  providers: [PersonajesBdService],
})
export class PersonajesBdModule {}
