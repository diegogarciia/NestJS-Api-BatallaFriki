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

  @Get('ranking')
  getRanking() {
    return this.personajeService.getRanking();
  }

  @Get('stats')
  getStats() {
    return this.personajeService.getStats();
  }

  @Post('atacarEspecial')
  specialAttack(@Body() body: { atacanteId: number; objetivoId: number }) {
    return this.personajeService.ataqueEspecial(body.atacanteId, body.objetivoId);
  }

  @Post('reiniciarPartida')
  reiniciarPartida() {
    return this.personajeService.reiniciarPartida();
  }
}