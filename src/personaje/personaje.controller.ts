import { Body, Controller, Get, Post } from '@nestjs/common';
import { PersonajeService } from './personaje.service';

@Controller('personajes')
export class PersonajeController {
  constructor(private readonly personajeService: PersonajeService) {}

  @Get()
  getAll() {
    return this.personajeService.findAll();
  }

  @Post('atacar')
  atacar(@Body() body: { atacanteId: number; objetivoId: number }) {
    return this.personajeService.atacar(body.atacanteId, body.objetivoId);
  }

  @Post('reiniciarPartida')
  reiniciarPartida() {
    return this.personajeService.reiniciarPartida();
  }
}