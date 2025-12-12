// app.routes.ts
import { Routes } from '@angular/router';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';
import {Home} from './Components/home/home';
import { Meal } from './Components/meal/meal';
import { SavedMeals } from './Components/saved-meals/saved-meals';
import { Planned } from './Components/planned/planned';
import { ShoppingList } from './Components/shopping-list/shopping-list';

export const routes: Routes = [
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'planned', component: Planned },
  { path: 'shopping', component: ShoppingList },
  { path: 'meal/:id', component: Meal },
  { path: 'savedMeals/:id', component: SavedMeals },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
