import { Component, OnInit, signal } from '@angular/core';
import { MealCard } from '../meal-card/meal-card';
import { Navbar } from "../navbar/navbar";
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { ToastService } from '../../Services/toast.service';
import { getDocs,collection, doc ,deleteDoc} from 'firebase/firestore';
import { Firebase } from '../../auth/firebase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planned',
  imports: [MealCard, Navbar,CommonModule, LoadingSpinner],
  templateUrl: './planned.html',
  styleUrl: './planned.css',
})
export class Planned implements OnInit{
  constructor(private store:Firebase, private toast: ToastService){}
  plannedMeals:any=signal([])
  loading = signal(true)
  
  async getPlannedMeals()
  {
    
    const coll = collection(this.store.db,'users',this.store.user()?.uid,'plannedMeals');
    const allMeals = await getDocs(coll)
    allMeals.docs.map(item => {
      this.plannedMeals.set([...this.plannedMeals(),item.data()])
    })
  }
  async removeRecipe(id:any,mealName:string)
  {
      const userUID = this.store.user()?.uid;
      try 
      {
        const docRef = doc(this.store.db, 'users', userUID, 'plannedMeals', String(id));
        await deleteDoc(docRef);
        this.toast.success(`${mealName} meal deleted successfully`);
        document.location.reload();
      }
      catch(error: any)
      {
        this.toast.error(`Error: Can't delete the meal.`);
      }
  }
  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      await this.getPlannedMeals()
    } finally {
      this.loading.set(false);
    }
  }
}
