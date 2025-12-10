// app.routes.ts
import { Routes } from '@angular/router';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';
import {Home} from './Components/home/home';

export const routes: Routes = [
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
