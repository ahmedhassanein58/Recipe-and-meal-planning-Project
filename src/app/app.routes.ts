// app.routes.ts
import { Routes } from '@angular/router';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';

export const routes: Routes = [
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
