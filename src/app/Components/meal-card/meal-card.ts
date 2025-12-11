import { Component, input } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-meal-card',
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.css',
})
export class MealCard {
  mealID = input('')
  name = input('')
  category = input('')
  area = input('')
  img = input('')
  disabled = input()
  constructor(private router:Router){}
  goToProduct()
  {
    this.router.navigate(['/meal',Number(this.mealID())])
  }
}
