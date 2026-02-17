import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonajeModule } from './personaje/personaje.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PersonajesBdModule } from './personajes-bd/personajes-bd.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PersonajeModule, UsersModule, ConfigModule.forRoot({ isGlobal: true }), PersonajesBdModule, AuthModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
