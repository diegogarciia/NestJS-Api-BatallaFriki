export class Juego {
  id: string;             
  jugadorId: number;      
  
  nombreJugador: string;
  vidaActualJugador: number;
  vidaMaxJugador: number;
  ataqueJugador: number;

  nombreRival: string;
  vidaActualRival: number;
  vidaMaxRival: number;
  ataqueRival: number;
  
  rivalEsCpu: boolean;    
  oponenteId?: number;    
  ganadorId?: number;     
  
  turno: 'JUGADOR' | 'RIVAL';
  finalizado: boolean;
}