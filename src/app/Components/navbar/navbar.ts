import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Firebase } from '../../auth/firebase';
import { Inject } from '@angular/core';
import { signal } from '@angular/core';
import firebase from 'firebase/compat/app';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  providers: [Firebase],
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  active;
  constructor(public firebase: Firebase) 
  {
    this.active = this.firebase.user;
    
  }
  async onLogout($event:any)
  {
    try 
    {
        await this.firebase.logout($event)
    }
    catch (err:any)
    {
      alert("Signout failed " + (err.message))
    }
  }
  
}
