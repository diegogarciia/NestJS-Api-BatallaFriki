import { Injectable } from '@nestjs/common';
import { CreatePersonajesBdDto } from './dto/create-personajes-bd.dto';
import { UpdatePersonajesBdDto } from './dto/update-personajes-bd.dto';

@Injectable()
export class PersonajesBdService {
  create(createPersonajesBdDto: CreatePersonajesBdDto) {
    return 'This action adds a new personajesBd';
  }

  findAll() {
    return `This action returns all personajesBd`;
  }

  findOne(id: number) {
    return `This action returns a #${id} personajesBd`;
  }

  update(id: number, updatePersonajesBdDto: UpdatePersonajesBdDto) {
    return `This action updates a #${id} personajesBd`;
  }

  remove(id: number) {
    return `This action removes a #${id} personajesBd`;
  }
}
