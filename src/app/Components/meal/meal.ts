import { Component, OnInit,signal,input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firebase } from '../../auth/firebase';
import { setDoc,doc,serverTimestamp, collection, getDoc } from 'firebase/firestore';
import { Navbar } from "../navbar/navbar";

@Component({
  selector: 'app-product',
  imports: [CommonModule, Navbar],
  providers: [Firebase],
  templateUrl: './meal.html',
  styleUrl: './meal.css',
})
export class Meal implements OnInit {
  constructor(private route:ActivatedRoute, private firebase:Firebase){}
  id:any;
  meal:any;
  isDisabled = signal(false)

  img = signal('')
  name = signal('')
  country = signal('')
  description = signal('')
  ingredients:any = signal([])
  category:any = signal('')

  async getMealInfo(id:number)
  {
    try 
    {
      const data = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const res = await data.json();
      return res;
    }
    catch(err)
    {
      alert(`unable to find the item with id ${id}`)
    }
  }
  getIngredients(meal:any)
  {
    for (let i = 1; i <= 20; i++)
    {
      const ing = meal[`strIngredient${i}`]
      if (ing && ing.trim() != "")
      {
        this.ingredients.set([...this.ingredients(),ing.trim()])
      }
    }
    return this.ingredients();
  }
  async getMeal(mealId:any)
  {
    const uuid = this.firebase.user()?.uid;
    const db = this.firebase.db;
    // console.log(`uuid value is ${uuid}`)
    const refDoc = doc(db, "users", uuid, "savedRecipes", mealId);
    // mealDoc.data()
    const meal = await getDoc(refDoc)
    if (meal.exists())
    {
      console.log(meal.data())
    }
    else
    {
      return;
    }
    return meal.data();
  }
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = id;
    this.meal = await this.getMealInfo(Number(id));
    this.name.set(this.meal.meals[0].strMeal);
    this.country.set(this.meal.meals[0].strArea);
    this.description.set(this.meal.meals[0].strInstructions);
    this.getIngredients(this.meal.meals[0]);
    // console.log(this.ingredients())
    this.img.set(this.meal.meals[0].strMealThumb);
    this.category.set(this.meal.meals[0].strCategory)
    const meal = await this.getMeal(id);
    // console.log(meal)
    if (meal)
      this.isDisabled.set(true);
  }
  async saveRecipe()
  {
    const user = this.firebase.user();
    try 
    {
      await setDoc(doc(this.firebase.db,'users',user.uid,'savedRecipes',String(this.id)),{
        savedAt: serverTimestamp(),
        id: this.id,
        name: this.name(),
        country: this.country(),
        description: this.description(),
        image: this.img(),
        category: this.category(),
        ingredients: this.ingredients()
      })
      alert(`Meal saved`)
    }
    catch(error: any)
    {
      alert(`can't store ${this.name()} meal`)
    }
  }

}
