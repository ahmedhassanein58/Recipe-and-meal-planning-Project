import { Component, OnInit, signal, ViewChild, ElementRef} from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { CommonModule } from '@angular/common';
import { MealCard } from "../meal-card/meal-card";
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Firebase } from '../../auth/firebase';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../Services/toast.service';

@Component({
  selector: 'app-home',
  imports: [Navbar, CommonModule, MealCard, LoadingSpinner, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  meals:any = signal([])
  ingredients:any = signal([])
  categories: any = signal([])
  allPosts: any = signal([])
  loading = signal(true)
  type = signal('')
  date: Date | null = null;
  currentMeal: any;
  @ViewChild('planDialog') dialog!: ElementRef<HTMLDialogElement>;
  
  constructor(public store:Firebase, private router: Router, private toast: ToastService){};
  async reqMeal()
  {
    const letters = [];
    let count = 0;
    for (let i = 65; i < 80; i++)
    {
      letters[count] = String.fromCharCode(i);
      let data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letters[count]}`)
      let res:any = await data.json();
      res.meals = res.meals.map((item:any) => {
        return {...item,publisher: 'admin'}
      })

      if (res.meals)
      {
        this.meals().push(...res.meals);
      }
      count++;
    }
    let shuffled = [...this.meals()].sort(() => Math.random() - 0.5);
    shuffled.unshift(...this.allPosts())
    this.meals.set(shuffled.slice(0, 18));
    console.log(...this.meals())
    return this.meals();
  }
  async getUsersRecipes()
  {
    // get recipes of the users you follow and then to added it to shuffled
    // array to be displayed on the home page
    try 
    {
      const usersRef = collection(this.store.db, 'users');
      const users = await getDocs(usersRef);
      for (const userDoc of users.docs) 
      {
        const coll = collection(this.store.db,'users',userDoc.id,'posts');
        const posts = await getDocs(coll);
        posts.docs.forEach(post => {
          this.allPosts().push({
            ...post.data(),
            id: post.id, // Include the post ID
            userId: userDoc.id
          });
        });
      }
    }
    catch(err:any)
    {
      console.log(`error from user recipes is ${err.message}`)
    }
    console.log(...this.allPosts())
  }
  async getCategories()
  {
    let data = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`)
    let res:any = await data.json();
    this.categories.set(res.categories);
    return this.categories();
  }
  
  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      await this.getUsersRecipes();
      let data = await this.reqMeal();
      let categories = await this.getCategories();
      // console.log(data)
    } finally {
      this.loading.set(false);
    }
  }

  navigateToCategory(categoryName: string): void {
    this.router.navigate(['/recipes'], { queryParams: { category: categoryName } });
  }

  planMeal(meal: any) {
    if (!this.store.user()) {
      this.toast.warning('Please login to plan meals');
      this.router.navigate(['/login']);
      return;
    }
    this.currentMeal = meal;
    this.dialog.nativeElement.showModal();
  }

  closeDialog() {
    this.dialog.nativeElement.close();
  }

  async complete() {
    await this.saveToPlanned();
    this.dialog.nativeElement.close();
  }

  async saveToPlanned() {
    const userUid = this.store.user()?.uid;
    if (!userUid) return;

    const mealId = this.currentMeal.idMeal || this.currentMeal.id;
    const plannedDoc = doc(this.store.db, 'users', userUid, 'plannedMeals', String(mealId));
    
    const name = this.currentMeal.strMeal || this.currentMeal.name;
    const mealIdValue = mealId;
    const country = this.currentMeal.strArea || this.currentMeal.country;
    const cat = this.currentMeal.strCategory || this.currentMeal.category;
    const img = this.currentMeal.strMealThumb || this.currentMeal.image;
    const description = this.currentMeal.strInstructions || this.currentMeal.description;
    
    // Get ingredients
    let ingred: string[] = [];
    if (this.currentMeal.ingredients && Array.isArray(this.currentMeal.ingredients)) {
      ingred = this.currentMeal.ingredients;
    } else {
      for (let i = 1; i <= 20; i++) {
        const ing = this.currentMeal[`strIngredient${i}`];
        if (ing && ing.trim() !== '') {
          ingred.push(ing.trim());
        }
      }
    }

    const month = this.date?.getMonth();
    const year = this.date?.getFullYear();
    const day = this.date?.getDate();
    
    if (!this.date || !this.type()) {
      this.toast.warning('Please select a date and meal type');
      return;
    }

    const collRef = collection(this.store.db, "users", userUid, "plannedMeals");
    const plannedMeals = await getDocs(collRef);
    let isFound = false;
    
    plannedMeals.docs.forEach(doc => {
      const data = doc.data();
      if (data['year'] == year && data['month'] == month 
        && data['dayInMonth'] == day && this.type() == data['mealType']) {
        this.toast.warning("There is already a planned meal for this time slot");
        isFound = true;
      }
    });
    
    if (isFound) return;

    await setDoc(plannedDoc, {
      savedAt: serverTimestamp(),
      id: mealIdValue,
      name: name,
      country: country,
      ingredients: ingred,
      image: img,
      category: cat,
      description: description,
      mealType: this.type(),
      year: year,
      month: month,
      dayInMonth: day
    });
    
    this.toast.success("Meal saved to planned meals");
    this.type.set('');
    this.date = null;
  }
}
