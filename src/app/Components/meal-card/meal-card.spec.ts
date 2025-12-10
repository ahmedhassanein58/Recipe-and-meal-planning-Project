import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealCard } from './meal-card';

describe('MealCard', () => {
  let component: MealCard;
  let fixture: ComponentFixture<MealCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
