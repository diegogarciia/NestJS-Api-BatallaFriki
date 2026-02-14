import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const userDocument = await this.usersService.findEmail(email);

    if (!userDocument || !userDocument.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (pass === userDocument.password) {
      const user = userDocument.toObject();
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: Array.isArray(user.roles) ? user.roles : [user.roles],
    };
    console.log('JWT Payload:', payload);
    const token = this.jwtService.sign(payload);
    console.log('Generated JWT:', token);
    return {
      payload: payload,
      access_token: this.jwtService.sign(payload),
    };
  }
}