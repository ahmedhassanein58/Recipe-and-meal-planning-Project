import { Component, signal } from '@angular/core';
import { Signup } from './Components/signup/signup';
import { Login } from './Components/login/login';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Toast } from './Components/toast/toast';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports:[
    FormsModule,
    CommonModule,
    RouterOutlet,
    Toast
  ],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FoodRecipe');
}
