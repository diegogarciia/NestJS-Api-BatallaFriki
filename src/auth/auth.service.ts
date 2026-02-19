import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      
      roles: [user.rol], 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nick: user.nick,
        email: user.email,
        roles: [user.rol], 
        nivel: user.nivel,
        experiencia: user.experiencia,
        victorias: user.victorias,
        derrotas: user.derrotas
      }
    };
  }
}