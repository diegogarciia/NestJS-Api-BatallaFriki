import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString, IsArray, ArrayNotEmpty, ArrayUnique, IsInt } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsOptional()
    @IsString()
    nombre: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsString({ each: true })
    roles?: string[];

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