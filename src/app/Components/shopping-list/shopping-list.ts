import { Component, OnInit, signal } from '@angular/core';
import { Firebase } from '../../auth/firebase';
import { collection,getDocs } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { Navbar } from "../navbar/navbar";
@Component({
  selector: 'app-shopping-list',
  imports: [CommonModule, Navbar],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.css',
})
export class ShoppingList implements OnInit{
  constructor(private store:Firebase){}
  mealIngredients = signal(new Map<string,string[]>()); // key value for name and ingred
  mealNames:any = signal([]) // split the meal ingredients
  mealIngreds:any = signal([]) // split the meal ingredients

  async getPlannedMeals()
  {
    
    const coll = collection(this.store.db,'users',this.store.user()?.uid,'plannedMeals');
    const allMeals = await getDocs(coll)
    allMeals.docs.map(item => {
      this.mealIngredients.update(oldmap => 
      {
        const newMap = new Map(oldmap);
        newMap.set(item.data()!['name'],[...item.data()!['ingredients'],item.data()]);
        return newMap;
      })
    })
    this.mealNames.set(Array.from(this.mealIngredients().keys()))
    this.mealIngreds.set(Array.from(this.mealIngredients().values()))
  }
  async ngOnInit(): Promise<void> {
    await this.getPlannedMeals()
  }
}
