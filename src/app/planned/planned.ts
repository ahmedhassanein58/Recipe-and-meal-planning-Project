import { Component } from '@angular/core';
import { MealCard } from '../Components/meal-card/meal-card';
import { Navbar } from "../Components/navbar/navbar";

@Component({
  selector: 'app-planned',
  imports: [MealCard, Navbar],
  templateUrl: './planned.html',
  styleUrl: './planned.css',
})
export class Planned {
  
}
