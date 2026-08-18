import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortSelectorComponent } from './port-selector.component';

describe('PortSelectorComponent', () => {
  let component: PortSelectorComponent;
  let fixture: ComponentFixture<PortSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
