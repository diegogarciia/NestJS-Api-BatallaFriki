import { IsInt, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum TipoOponente {
  CPU = 'CPU',
  USUARIO = 'USUARIO',
}

export class CreateJuegoDto {
  @IsInt()
  @IsNotEmpty()
  personajeJugadorId: number; 

  @IsEnum(TipoOponente)
  @IsNotEmpty()
  tipoOponente: TipoOponente; 

  @IsInt()
  @IsOptional()
  oponenteId?: number; 

  @IsInt()
  @IsOptional()
  personajeOponenteId?: number; 
}