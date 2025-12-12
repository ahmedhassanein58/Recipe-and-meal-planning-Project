import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { doc } from 'firebase/firestore/lite';
import { collection, getDocs,doc,getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Firebase } from '../../auth/firebase';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealCard } from '../meal-card/meal-card';
import { Navbar } from '../navbar/navbar';
import { ElementRef,ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { HarmCategory } from 'firebase/ai';
import { Meal } from '../meal/meal';
// import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-saved-meals',
  templateUrl: './saved-meals.html',
  providers: [Firebase],
  imports: [CommonModule, MealCard, Navbar, FormsModule],
  styleUrl: './saved-meals.css',
})
export class SavedMeals implements OnInit {
  savedMeals:any = signal([])
  type:any=signal('')
  date:Date |null = null;
  currentMeal:any;
  // time:Date;
  constructor(private route: ActivatedRoute,private store: Firebase){}
  @ViewChild('planDialog')dialog!: ElementRef<HTMLDialogElement>;
  closeDialog()
  {
    this.dialog.nativeElement.close();
  }
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
  async complete(id:string)
  {
    await this.saveToPlanned(id);
    this.dialog.nativeElement.close();
  }
  async saveToPlanned(id:string)
  {
    const db = this.store.db;
    const userUid = this.store.user()?.uid;

    const plannedDoc = doc(db,'users',userUid,'plannedMeals',id);
    const ref = doc(this.store.db, 'users', userUid, 'savedRecipes', id);
    const snapshot = await getDoc(ref);
    const name = snapshot.data()!['name'];
    const mealId = snapshot.data()!['id'];
    const country = snapshot.data()!['country'];
    const ingred = snapshot.data()!['ingredients'];
    const cat = snapshot.data()!['category'];
    const img = snapshot.data()!['image'];
    const description = snapshot.data()!['description'];
    const month = this.date?.getMonth();
    const year = this.date?.getFullYear();
    const date = this.date?.getDate();
    const collRef = collection(this.store.db, "users", userUid, "plannedMeals");
    let isFound = false;
    const plannedMeals = await getDocs(collRef)
    plannedMeals.docs.forEach(doc => {
    const data = doc.data();  // document fields    
    if (data['year'] == year && data['month'] == month 
      && data['dayInMonth'] == date && this.type() == data['mealType'])
    {
      alert("There is a planned meal for this slot")
      isFound = true;
    }
    // Example: check a field
    // if (data['id'] === "52772") {
    //   console.log("Found this meal:", data['name']);
    // }
  });
  if (isFound)
    return;
  await setDoc(plannedDoc,{
    savedAt: serverTimestamp(),
    id: mealId,
    name: name,
    country: country,
    ingredients: ingred,
    image: img,
    category:cat,
    description: description,
    mealType: this.type(),
    year: year,
    month: month,
    dayInMonth: date
      //get year month and day of the meal
  })
  alert("saved to planned meals")
  }
  planMeal(meal:any)
  {
    this.currentMeal = meal;
    this.dialog.nativeElement.showModal();
  }
  async ngOnInit(): Promise<void> {
    await this.getMealsByUser()
  }
}