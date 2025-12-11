import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedMeals } from './saved-meals';

describe('SavedMeals', () => {
  let component: SavedMeals;
  let fixture: ComponentFixture<SavedMeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedMeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedMeals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
