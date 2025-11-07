import { Test, TestingModule } from '@nestjs/testing';
import { TiposSolicitudService } from './tipos-solicitud.service';

describe('TiposSolicitudService', () => {
  let service: TiposSolicitudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiposSolicitudService],
    }).compile();

    service = module.get<TiposSolicitudService>(TiposSolicitudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
