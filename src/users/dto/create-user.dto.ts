import { IsEmail, IsInt, IsString, IsArray, ArrayNotEmpty, ArrayUnique, IsOptional, IsIn } from "class-validator";

export class CreateUserDto {

  @IsString()
  nick: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(['ADMIN', 'USER'])
  rol?: string;

  @IsOptional()
  @IsInt()
  nivel?: number;

  @IsOptional()
  @IsInt()
  experiencia?: number;

  @IsOptional()
  @IsInt()
  victorias?: number;

  @IsOptional()
  @IsInt()
  derrotas?: number;

}