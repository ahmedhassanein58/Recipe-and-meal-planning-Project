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
    const value = this.ingred.nativeElement.value.trim();
    if (value) {
      this.ingredients.set([...this.ingredients(), value]);
      this.ingred.nativeElement.value = '';
    }
  }
  
  removeIngred(index: number) {
    const newIngredients = [...this.ingredients()];
    newIngredients.splice(index, 1);
    this.ingredients.set(newIngredients);
  }
  
  resetForm() {
    this.name.set('');
    this.country.set('');
    this.description.set('');
    this.img.set('');
    this.category.set('');
    this.ingredients.set([]);
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
    // Validation
    if (!this.name().trim()) {
      this.toast.warning('Please enter a meal name');
      return;
    }
    
    if (!this.country().trim()) {
      this.toast.warning('Please enter a country/cuisine');
      return;
    }
    
    if (!this.category()) {
      this.toast.warning('Please select a category');
      return;
    }
    
    if (!this.description().trim()) {
      this.toast.warning('Please enter a description/instructions');
      return;
    }
    
    if (!this.img().trim()) {
      this.toast.warning('Please enter an image URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(this.img());
    } catch (e) {
      this.toast.warning('Please enter a valid image URL');
      return;
    }
    
    if (this.ingredients().length === 0) {
      this.toast.warning('Please add at least one ingredient');
      return;
    }
    
    if (!this.store.user()) {
      this.toast.warning('You must be logged in to create a recipe');
      return;
    }
    
    this.rand.set(Math.random()*10000);
    const recipe = doc(this.db,'users',this.store.user()?.uid,'posts',String(this.rand()));
    const userName = await this.getUserName();
    
    if (!userName) {
      this.toast.error('Unable to get user information');
      return;
    }
    
    try 
    {
      await setDoc(recipe,
        {
          savedAt: serverTimestamp(),
          name: this.name().trim(),
          country: this.country().trim(),
          description: this.description().trim(),
          image: this.img().trim(),
          category: this.category(),
          ingredients: this.ingredients(),
          publisher: userName
      })
      this.toast.success(`Recipe "${this.name()}" posted successfully!`)
      this.resetForm();
    }
    
    catch(error: any)
    {
      console.log(error.message)
      this.toast.error(`Unable to save recipe: ${error.message}`)
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