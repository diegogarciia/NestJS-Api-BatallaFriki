import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonajeModule } from './personaje/personaje.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PersonajeModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
