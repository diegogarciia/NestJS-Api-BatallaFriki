import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PersonajesBdService } from './personajes-bd.service';
import { CreatePersonajesBdDto } from './dto/create-personajes-bd.dto';
import { UpdatePersonajesBdDto } from './dto/update-personajes-bd.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

@Controller('personajes-bd')
export class PersonajesBdController {
  constructor(private readonly personajesBdService: PersonajesBdService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createPersonajesBdDto: CreatePersonajesBdDto) {
    return this.personajesBdService.create(createPersonajesBdDto);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.personajesBdService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personajesBdService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePersonajesBdDto: UpdatePersonajesBdDto
  ) {
    return this.personajesBdService.update(id, updatePersonajesBdDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personajesBdService.remove(id);
  }

}