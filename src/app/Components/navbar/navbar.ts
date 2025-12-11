import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { Firebase } from '../../auth/firebase';

@Component({
  selector: 'app-navbar',
  providers: [Firebase],
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  active;
  constructor(public firebase: Firebase, private router:Router) 
  {
    this.active = this.firebase.user;
  }
  async onLogout($event:any)
  {
    try 
    {
        await this.firebase.logout($event)
        this.goToLogin()
    }
    catch (err:any)
    {
      alert("Signout failed " + (err.message))
    }
  }
  goToHome()
  {
    this.router.navigate(['/home'])
    // routerLink="/home"
  }
  goToPlan()
  {
    this.router.navigate(['/planned'])
  }
  goToSaved()
  {
    // console.log('sdf')
    this.router.navigate(['/savedMeals',this.active().uid])
  }
  goToLogin()
  {
    this.router.navigate(["/login"])
  }
}
