import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonajesBdService } from './personajes-bd.service';
import { CreatePersonajesBdDto } from './dto/create-personajes-bd.dto';
import { UpdatePersonajesBdDto } from './dto/update-personajes-bd.dto';

@Controller('personajes-bd')
export class PersonajesBdController {
  constructor(private readonly personajesBdService: PersonajesBdService) {}

  @Post()
  create(@Body() createPersonajesBdDto: CreatePersonajesBdDto) {
    return this.personajesBdService.create(createPersonajesBdDto);
  }

  @Get()
  findAll() {
    return this.personajesBdService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personajesBdService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonajesBdDto: UpdatePersonajesBdDto) {
    return this.personajesBdService.update(+id, updatePersonajesBdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personajesBdService.remove(+id);
  }
}
