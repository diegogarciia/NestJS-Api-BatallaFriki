import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Personaje } from './entities/personaje.entity';

@Injectable()
export class PersonajeService {

  private personajes: Personaje[] = [
    { id: 1, name: 'Gandalf', hp: 100, attack: 20, level: 1 },
    { id: 2, name: 'Sauron', hp: 30, attack: 5, level: 1 },
  ];

  findAll(): Personaje[] {
    return this.personajes;
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

    objetivo.hp = objetivo.hp - atacante.attack;
    
    if (objetivo.hp < 0) objetivo.hp = 0;

    return {
      message: `${atacante.name} atacó a ${objetivo.name}`,
      objetivoStatus: objetivo 
    };
  }

  reiniciarPartida() {
    this.personajes = [
      { id: 1, name: 'Gandalf', hp: 100, attack: 20, level: 1 },
      { id: 2, name: 'Sauron', hp: 30, attack: 5, level: 1 },
    ];
    return { message: 'Juego reiniciado.' };
  }

}