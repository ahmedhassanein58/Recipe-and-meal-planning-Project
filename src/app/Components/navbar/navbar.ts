import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Firebase } from '../../auth/firebase';
import { Inject } from '@angular/core';
import { signal } from '@angular/core';
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
  
  // Use the signal directly
  
}
