import { IsEmail, IsInt, IsString, IsArray, ArrayNotEmpty, ArrayUnique, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsInt()
  id: number;

  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];

  @IsOptional()
  @IsInt()
  nivel: number;

  @IsOptional()
  @IsInt()
  experiencia: number;

  @IsOptional()
  @IsInt()
  victorias: number;

  @IsOptional()
  @IsInt()
  derrotas: number;

}