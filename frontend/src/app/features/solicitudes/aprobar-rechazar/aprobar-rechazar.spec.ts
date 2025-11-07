import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobarRechazar } from './aprobar-rechazar';

describe('AprobarRechazar', () => {
  let component: AprobarRechazar;
  let fixture: ComponentFixture<AprobarRechazar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprobarRechazar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprobarRechazar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
