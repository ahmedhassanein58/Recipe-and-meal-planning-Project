import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  constructor(private router: Router, private authService: AuthService){};

  userObject = {
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  };

  onSignUp() {
    //Validate user input dirst before calling the auth service
    if (!this.userObject.username) {
      Swal.fire({
        icon: 'warning',
        title: 'Username Required',
        text: 'Please enter a username'
      });
      return;
    }
    if (!this.userObject.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Required',
        text: 'Please enter a password'
      });
      return;
    }
    if (!this.userObject.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter an email'
      });
      return;
    }
    if (!this.userObject.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Confirmation Required',
        text: 'Please confirm your password'
      });
      return;
    }
    if (this.userObject.password !== this.userObject.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match'
      });
      return;
    }

    //Call the auth service to add the user
    const result = this.authService.addUser(this.userObject);
    //If the user is added successfully, navigate to the users list
    if(!result) {
      return;
    }
    this.userObject = {username: "", email: "", password: "", confirmPassword: ""};
    this.router.navigate(['/usersList']);
  }
}
