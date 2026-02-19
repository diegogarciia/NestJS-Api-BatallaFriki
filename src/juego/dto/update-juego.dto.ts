import { PartialType } from '@nestjs/mapped-types';
import { CreateJuegoDto } from './create-juego.dto';

export class UpdateJuegoDto extends PartialType(CreateJuegoDto) {}
