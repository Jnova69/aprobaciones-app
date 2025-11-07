import { TestBed } from '@angular/core/testing';

import { TiposSolicitud } from './tipos-solicitud';

describe('TiposSolicitud', () => {
  let service: TiposSolicitud;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposSolicitud);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
