import { Injectable } from '@nestjs/common';
import { CreatePersonajesBdDto } from './dto/create-personajes-bd.dto';
import { UpdatePersonajesBdDto } from './dto/update-personajes-bd.dto';
import { PrismaService } from '../prisma/prisma.service'; 

@Injectable()
export class PersonajesBdService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPersonajesBdDto: CreatePersonajesBdDto) {
    return this.prisma.character.create({
      data: createPersonajesBdDto,
    });
  }

  findAll() {
    return this.prisma.character.findMany();
  }

  findOne(id: number) {
    return this.prisma.character.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePersonajesBdDto: UpdatePersonajesBdDto) {
    return this.prisma.character.update({
      where: { id },
      data: updatePersonajesBdDto,
    });
  }

  remove(id: number) {
    return this.prisma.character.delete({
      where: { id },
    });
  }

}