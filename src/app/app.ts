import { Component, signal } from '@angular/core';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports:[
    FormsModule,
    CommonModule,
    RouterOutlet
  ],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FoodRecipe');
}
