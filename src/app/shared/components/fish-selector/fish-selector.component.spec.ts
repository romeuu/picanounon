import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FishSelectorComponent } from './fish-selector.component';

describe('FishSelectorComponent', () => {
  let component: FishSelectorComponent;
  let fixture: ComponentFixture<FishSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FishSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FishSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
