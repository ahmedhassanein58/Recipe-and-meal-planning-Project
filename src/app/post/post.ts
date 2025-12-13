import { Component, ElementRef, OnInit,signal, ViewChild } from '@angular/core';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { Firebase } from '../auth/firebase';
import { Navbar } from "../Components/navbar/navbar";
import { ToastService } from '../Services/toast.service';
import { serverTimestamp } from 'firebase/firestore';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  // imports: [FormsModule],
  templateUrl: './post.html',
  styleUrl: './post.css',
  imports: [Navbar,CommonModule,FormsModule]
})
export class Post implements OnInit {
  constructor(private store:Firebase, private toast: ToastService){}
  db:any;
  name = signal('')
  country = signal('')
  description = signal('')
  rand = signal(0)
  img = signal('')
  category = signal('')
  ingredients:any = signal([])
  categories:any = signal([])
  @ViewChild('ingredInput')ingred!:ElementRef<HTMLInputElement>;
  addIngred()
  {
    this.ingredients.set([...this.ingredients(),this.ingred.nativeElement.value]);
    this.ingred.nativeElement.value = '';
  }
  async getCategories()
  {
    let data = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`)
    let res:any = await data.json();
    // console.log(resc)
    this.categories.set(res.categories);
    return this.categories();
  }
  async getUserName()
  {
    const userDoc = doc(this.db,'users',this.store.user()?.uid);
    const user = await getDoc(userDoc);
    if (user.exists())
    {
      return user.data()['username']
    }
    else
    {
      console.log('user not found')
      return;
    }
  }
  async createRecipe()
  {
    // const mealId = collection(this.db,'users')
    this.rand.set(Math.random()*10000);
    const recipe = doc(this.db,'users',this.store.user()?.uid,'posts',String(this.rand()));
    const userName = await this.getUserName();
    // console.log(userName)
    try 
    {
      await setDoc(recipe,
        {
          savedAt: serverTimestamp(),
          name: this.name(), // meal name
          country: this.country(),
          description: this.description(),
          image: this.img(),
          category: this.category(),
          ingredients: this.ingredients(),
          publisher: userName // user name detected automaticaly for current user
      })
      this.toast.success(`Recipe posted successfully!`)
    }
    
    catch(error: any)
    {
      console.log(error.message)
      this.toast.error(`Can't store ${this.name()} recipe`)
    }
   
  }
  async saveMeal()
  {
    await this.createRecipe();
  }
  async ngOnInit(): Promise<void> {
    this.db = this.store.db;
    await this.getCategories();
  }
}