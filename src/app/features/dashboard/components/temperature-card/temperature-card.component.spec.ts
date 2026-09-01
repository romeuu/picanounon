import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperatureCardComponent } from './temperature-card.component';

describe('TemperatureCardComponent', () => {
  let component: TemperatureCardComponent;
  let fixture: ComponentFixture<TemperatureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemperatureCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemperatureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
