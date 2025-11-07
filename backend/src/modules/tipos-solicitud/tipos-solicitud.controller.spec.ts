import { Test, TestingModule } from '@nestjs/testing';
import { TiposSolicitudController } from './tipos-solicitud.controller';

describe('TiposSolicitudController', () => {
  let controller: TiposSolicitudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposSolicitudController],
    }).compile();

    controller = module.get<TiposSolicitudController>(TiposSolicitudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
