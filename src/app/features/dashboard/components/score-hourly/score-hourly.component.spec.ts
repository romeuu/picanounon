import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreHourlyComponent } from './score-hourly.component';

describe('ScoreHourlyComponent', () => {
  let component: ScoreHourlyComponent;
  let fixture: ComponentFixture<ScoreHourlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreHourlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreHourlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
