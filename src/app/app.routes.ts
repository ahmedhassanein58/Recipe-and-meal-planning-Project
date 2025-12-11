// app.routes.ts
import { Routes } from '@angular/router';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';
import {Home} from './Components/home/home';
import { Meal } from './Components/meal/meal';
import { SavedMeals } from './Components/saved-meals/saved-meals';

export const routes: Routes = [
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'meal/:id', component: Meal },
  { path: 'savedMeals/:id', component: SavedMeals },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
