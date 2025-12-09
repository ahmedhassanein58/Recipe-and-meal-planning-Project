import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';

const routes: Routes = [
  {path: "signup", component: Signup},
  {path: "login", component: Login},
  {path: "", redirectTo: "/login", pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
