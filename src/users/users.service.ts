import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getRanking() {
    return this.prisma.user.findMany({
      orderBy: {
        victorias: 'desc',
      },
      select: {
        nick: true,
        victorias: true,
        derrotas: true,
        nivel: true,
        experiencia: true
      },
    });
  }
  
  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;
    
    let dataToUpdate: any = { ...userData };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate, 
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
  
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}