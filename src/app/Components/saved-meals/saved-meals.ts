import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { doc } from 'firebase/firestore/lite';
import { collection, getDocs } from 'firebase/firestore';
import { Firebase } from '../../auth/firebase';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealCard } from '../meal-card/meal-card';
import { Navbar } from '../navbar/navbar';
@Component({
  selector: 'app-saved-meals',
  templateUrl: './saved-meals.html',
  providers: [Firebase],
  imports: [CommonModule,MealCard,Navbar],
  styleUrl: './saved-meals.css',
})
export class SavedMeals implements OnInit {
  savedMeals:any = signal([])
  constructor(private route: ActivatedRoute,private store: Firebase){}
  async getMealsByUser()
  {
    const id:string|null = this.route.snapshot.paramMap.get('id');
    const db = this.store.db;          // Firestore instance
    const userUid = this.store.user()?.uid;  // must be a string
    if (!userUid) return;

    const collec = collection(db,'users',userUid,'savedRecipes');
    const snapshot = await getDocs(collec);
    snapshot.docs.map(item => {
      this.savedMeals.set([...this.savedMeals(),item.data()])
    })
    // console.log(this.savedMeals())
  }
  async ngOnInit(): Promise<void> {
    await this.getMealsByUser()
  }
}
