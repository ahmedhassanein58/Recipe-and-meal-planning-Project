import { Component, OnInit, signal} from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { CommonModule } from '@angular/common';
import { MealCard } from "../meal-card/meal-card";
import { collection, getDocs } from 'firebase/firestore';
import { Firebase } from '../../auth/firebase';

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
  allPosts: any = signal([])
  constructor(private store:Firebase){};
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
    await this.getUsersRecipes();
    let data = await this.reqMeal();
    let categories = await this.getCategories();
    // console.log(data)
  }
}
