import { Component, model } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth';
import Swal from 'sweetalert2'; 
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  imports: [FormsModule,Navbar],
  styleUrl: './login.css',
})
export class Login {
  constructor(private router: Router, private authService: AuthService){};

  userObject = model({
    username: "",
    password: ""
  })

  onLogin() {
    //Validate user input dirst before calling the auth service
    if (!this.userObject().username) {
      Swal.fire({
        icon: 'warning',
        title: 'Username Required',
        text: 'Please enter a username'
      });
      return;
    }
    if (!this.userObject().password) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Required',
        text: 'Please enter a password'
      });
      return;
    }
  }

}
