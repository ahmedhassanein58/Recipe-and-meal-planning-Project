import { Component, OnInit, signal} from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { CommonModule } from '@angular/common';
import { MealCard } from "../meal-card/meal-card";

@Component({
  selector: 'app-home',
  imports: [Navbar, CommonModule, MealCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  meals:any = signal([])
  ingredients:any = signal([])
  categories: any = signal([])
  async reqMeal()
  {
    const letters = [];
    let count = 0;
    for (let i = 65; i < 80; i++)
    {
      letters[count] = String.fromCharCode(i);
      let data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letters[count]}`)
      let res:any = await data.json();
      if (res.meals)
      {
        this.meals().push(...res.meals);
      }
      count++;
    }
    const shuffled = [...this.meals()].sort(() => Math.random() - 0.5);
    this.meals.set(shuffled.slice(0, 18));
    return this.meals();
  }
  async getCategories()
  {
    let data = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`)
    let res:any = await data.json();
    this.categories.set(res.categories);
    return this.categories();
  }
  getIngredients(id:number)
  {
    for (let i = 1; i <= 20; i++)
    {
      const ing = this.meals()[id][`strIngredient${i}`]
      if (ing && ing.trim() != "")
      {
        this.ingredients().push(ing)
      }
    }
    return this.ingredients();
  }
  async ngOnInit(): Promise<void> {
    let data = await this.reqMeal();
    let categories = await this.getCategories();
    // console.log(data)
  }
}
