import { Component, input } from '@angular/core';
import { Router } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meal-card',
  imports: [CommonModule],
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.css',
})
export class MealCard {
  mealID = input('')
  name = input('')
  category = input('')
  area = input('')
  img = input('')
  publisher = input('')
  inputDes = input('Details')
  
  // disabled = input()
  constructor(private router:Router){}
  goToProduct()
  {
    // Use the mealID as-is (could be string for user posts or number for TheMealDB)
    const id = this.mealID();
    if (id) {
      this.router.navigate(['/meal', id]);
    }
  }
}
