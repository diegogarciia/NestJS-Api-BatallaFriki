import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personajesBdService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePersonajesBdDto: UpdatePersonajesBdDto
  ) {
    return this.personajesBdService.update(id, updatePersonajesBdDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personajesBdService.remove(id);
  }
}