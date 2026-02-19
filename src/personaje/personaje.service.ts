import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Personaje } from './entities/personaje.entity';

@Injectable()
export class PersonajeService {

  private personajes: Personaje[] = [
    { id: 1, name: 'Gandalf', hp: 100, attack: 20, level: 1 },
    { id: 2, name: 'Sauron', hp: 30, attack: 5, level: 1 },
  ];

  private totalAtaques = 0;

  findAll(): Personaje[] {
    return this.personajes;
  }

  getRanking(): Personaje[] {
    return [...this.personajes].sort((a, b) => b.hp - a.hp);
  }

  getStats() {
    return {
      totalAtaques: this.totalAtaques,
      personajesVivos: this.personajes.filter(p => p.hp > 0).length
    };
  }

  atacar(atacanteId: number, objetivoId: number) {
    if (atacanteId === objetivoId) {
      throw new BadRequestException('No puedes atacarte a ti mismo');
    }

    const atacante = this.personajes.find(c => c.id === Number(atacanteId));
    const objetivo = this.personajes.find(c => c.id === Number(objetivoId));

    if (!atacante || !objetivo) {
      throw new NotFoundException('Personaje no encontrado');
    }

    if (objetivo.hp <= 0) {
        throw new BadRequestException(`${objetivo.name} ya está muerto.`);
    }

    const danio = atacante.attack;
    objetivo.hp = Math.max(0, objetivo.hp - danio);

    this.totalAtaques++;

    return {
      message: `${atacante.name} atacó a ${objetivo.name} causando ${danio} de daño`,
      objetivoStatus: objetivo 
    };
  }

  ataqueEspecial(atacanteId: number, objetivoId: number) {
    const atacante = this.personajes.find(c => c.id === Number(atacanteId));
    const objetivo = this.personajes.find(c => c.id === Number(objetivoId));

    if (!atacante || !objetivo) throw new NotFoundException('Personaje no encontrado');

    const acierto = Math.random() > 0.5; 

    if (!acierto) {
        this.totalAtaques++;
        return { message: `${atacante.name} intentó un ataque especial pero... ¡FALLÓ!`, objetivoStatus: objetivo };
    }

    const danio = atacante.attack * 2; 
    objetivo.hp = Math.max(0, objetivo.hp - danio);
    this.totalAtaques++;

    return {
      message: `¡CRÍTICO! ${atacante.name} destrozó a ${objetivo.name} con ${danio} de daño.`,
      objetivoStatus: objetivo
    };
  }

  reiniciarPartida() {
    this.personajes = [
      { id: 1, name: 'Gandalf', hp: 100, attack: 20, level: 1 },
      { id: 2, name: 'Sauron', hp: 30, attack: 5, level: 1 },
    ];
    this.totalAtaques = 0; 
    return { message: 'Juego reiniciado.' };
  }

}