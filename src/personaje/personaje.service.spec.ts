import { Test, TestingModule } from '@nestjs/testing';
import { PersonajeService } from './personaje.service';

describe('PersonajeService', () => {
  let service: PersonajeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonajeService],
    }).compile();

    service = module.get<PersonajeService>(PersonajeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
