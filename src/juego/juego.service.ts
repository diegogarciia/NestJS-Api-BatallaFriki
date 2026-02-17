import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJuegoDto, TipoOponente } from './dto/create-juego.dto';
import { Juego } from './entities/juego.entity';

@Injectable()
export class JuegoService {
  private partidasActivas: Map<number, Juego> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async iniciarPartida(usuarioId: number, createJuegoDto: CreateJuegoDto): Promise<Juego> {
    const usuario = await this.prisma.user.findUnique({ where: { id: usuarioId } });
    const personajeJugador = await this.prisma.character.findUnique({ where: { id: createJuegoDto.personajeJugadorId } });

    if (!usuario || !personajeJugador) {
      throw new NotFoundException('Usuario o Personaje no encontrado');
    }

    const personajeRivalId = createJuegoDto.personajeOponenteId || 1; 
    const personajeRival = await this.prisma.character.findUnique({ where: { id: personajeRivalId } });
    
    if (!personajeRival) {
      throw new NotFoundException('El personaje rival no existe');
    }

    const nuevaPartida: Juego = {
      id: `game_${usuarioId}_${Date.now()}`,
      jugadorId: usuario.id,
      nombreJugador: usuario.nick,
      vidaMaxJugador: personajeJugador.vida,
      vidaActualJugador: personajeJugador.vida,
      ataqueJugador: personajeJugador.ataque,
      
      nombreRival: personajeRival.nombre,
      vidaMaxRival: personajeRival.vida,
      vidaActualRival: personajeRival.vida,
      ataqueRival: personajeRival.ataque,

      rivalEsCpu: createJuegoDto.tipoOponente === TipoOponente.CPU,
      oponenteId: createJuegoDto.tipoOponente === TipoOponente.USUARIO ? createJuegoDto.oponenteId : undefined,
      
      turno: 'JUGADOR',
      finalizado: false,
    };

    this.partidasActivas.set(usuarioId, nuevaPartida);
    return nuevaPartida;
  }

  async atacar(usuarioId: number): Promise<Juego> {
    const partida = this.partidasActivas.get(usuarioId);

    if (!partida) {
      throw new NotFoundException('No tienes ninguna partida activa');
    }

    if (partida.finalizado) {
      return partida;
    }

    partida.vidaActualRival -= partida.ataqueJugador;
    
    if (partida.vidaActualRival <= 0) {
      partida.vidaActualRival = 0;
      partida.finalizado = true;
      partida.ganadorId = usuarioId;
      
      await this.prisma.user.update({
        where: { id: usuarioId },
        data: { victorias: { increment: 1 }, experiencia: { increment: 50 } }
      });

      return partida;
    }

    if (partida.rivalEsCpu) {
      partida.vidaActualJugador -= partida.ataqueRival;

      if (partida.vidaActualJugador <= 0) {
        partida.vidaActualJugador = 0;
        partida.finalizado = true;
        
        await this.prisma.user.update({
          where: { id: usuarioId },
          data: { derrotas: { increment: 1 } }
        });
      }
    }

    return partida;
  }
}