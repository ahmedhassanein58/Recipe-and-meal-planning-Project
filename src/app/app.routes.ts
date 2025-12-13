// app.routes.ts
import { Routes } from '@angular/router';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';
import {Home} from './Components/home/home';
import { Meal } from './Components/meal/meal';
import { SavedMeals } from './Components/saved-meals/saved-meals';
import { Planned } from './Components/planned/planned';
import { ShoppingList } from './shopping-list/shopping-list';
import { Post } from './post/post';
import { Profile } from './Components/profile/profile';
import { Recipes } from './Components/recipes/recipes';

export const routes: Routes = [
  { path: 'signup', component: Signup, title: 'Sign Up - Le Festin' },
  { path: 'login', component: Login, title: 'Login - Le Festin' },
  { path: 'home', component: Home, title: 'Home - Le Festin' },
  { path: 'recipes', component: Recipes, title: 'Recipes - Le Festin' },
  { path: 'planned', component: Planned, title: 'Planned Meals - Le Festin' },
  { path: 'shopping', component: ShoppingList, title: 'Shopping List - Le Festin' },
  { path: 'post', component: Post, title: 'Create Recipe - Le Festin' },
  { path: 'meal/:id', component: Meal, title: 'Recipe Details - Le Festin' },
  { path: 'savedMeals/:id', component: SavedMeals, title: 'Saved Meals - Le Festin' },
  { path: 'profile', component: Profile, title: 'Profile - Le Festin' },
  { path: 'profile/:id', component: Profile, title: 'Profile - Le Festin' },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
