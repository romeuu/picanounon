import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardScoreComponent } from './card-score.component';

describe('CardScoreComponent', () => {
  let component: CardScoreComponent;
  let fixture: ComponentFixture<CardScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
