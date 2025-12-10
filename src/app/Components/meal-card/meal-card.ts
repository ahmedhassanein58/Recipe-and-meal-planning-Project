import { Component, input } from '@angular/core';

@Component({
  selector: 'app-meal-card',
  imports: [],
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.css',
})
export class MealCard {
  mealID = input('')
  name = input('')
  category = input('')
  area = input('')
  img = input('')
}
