import { Injectable } from '@nestjs/common';
import { CreateJuegoDto } from './dto/create-juego.dto';
import { UpdateJuegoDto } from './dto/update-juego.dto';

@Injectable()
export class JuegoService {
  create(createJuegoDto: CreateJuegoDto) {
    return 'This action adds a new juego';
  }

  findAll() {
    return `This action returns all juego`;
  }

  findOne(id: number) {
    return `This action returns a #${id} juego`;
  }

  update(id: number, updateJuegoDto: UpdateJuegoDto) {
    return `This action updates a #${id} juego`;
  }

  remove(id: number) {
    return `This action removes a #${id} juego`;
  }
}
