import { Module } from '@nestjs/common';
import { PersonajeController } from './personaje.controller';
import { PersonajeService } from './personaje.service';

@Module({
  controllers: [PersonajeController],
  providers: [PersonajeService]
})
export class PersonajeModule {}
