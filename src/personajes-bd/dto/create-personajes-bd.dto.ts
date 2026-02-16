import { IsString, IsInt, IsOptional, IsUrl, Min } from 'class-validator';

export class CreatePersonajesBdDto {
  
  @IsString()
  nombre: string;

  @IsInt()
  @Min(1) 
  vida: number;

  @IsInt()
  @Min(0) 
  ataque: number;

  @IsInt()
  @Min(1) 
  nivel: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nivelMinimoObtencion?: number; 

  @IsOptional()
  @IsString()
  @IsUrl()
  imagen?: string;
}