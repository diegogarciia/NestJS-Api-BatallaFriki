import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonajesBdDto } from './create-personajes-bd.dto';

export class UpdatePersonajesBdDto extends PartialType(CreatePersonajesBdDto) {}