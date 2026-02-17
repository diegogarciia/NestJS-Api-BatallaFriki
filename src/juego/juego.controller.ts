import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JuegoService } from './juego.service';
import { CreateJuegoDto } from './dto/create-juego.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('juego')
export class JuegoController {
  constructor(private readonly juegoService: JuegoService) {}

  @Post('iniciar')
  @UseGuards(JwtGuard)
  async iniciar(@Req() req, @Body() createJuegoDto: CreateJuegoDto) {
    const usuarioId = req.user.id; 
    return this.juegoService.iniciarPartida(usuarioId, createJuegoDto);
  }
}