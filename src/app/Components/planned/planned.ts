import { Component, OnInit, signal } from '@angular/core';
import { MealCard } from '../meal-card/meal-card';
import { Navbar } from "../navbar/navbar";
import { getDocs,collection } from 'firebase/firestore';
import { Firebase } from '../../auth/firebase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planned',
  imports: [MealCard, Navbar,CommonModule],
  templateUrl: './planned.html',
  styleUrl: './planned.css',
})
export class Planned implements OnInit{
  constructor(private store:Firebase){}
  plannedMeals:any=signal([])
  
  async getPlannedMeals()
  {
    
    const coll = collection(this.store.db,'users',this.store.user()?.uid,'plannedMeals');
    const allMeals = await getDocs(coll)
    allMeals.docs.map(item => {
      this.plannedMeals.set([...this.plannedMeals(),item.data()])
    })
  }
  async ngOnInit(): Promise<void> {
    await this.getPlannedMeals()
  }
}
