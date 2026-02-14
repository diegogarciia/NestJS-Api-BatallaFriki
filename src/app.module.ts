import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonajeModule } from './personaje/personaje.module';

@Module({
  imports: [PersonajeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
