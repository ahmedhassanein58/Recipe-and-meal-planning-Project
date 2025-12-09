import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { Firebase } from '../../auth/firebase';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  imports: [FormsModule, Navbar],
  providers: [Firebase],
  styleUrl: './signup.css',
})
export class Signup  {
  constructor(private router: Router, private authService: Firebase){};

  userObject = signal({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  isPassValid = signal(false)
  isEmailValid = signal(false)
  @ViewChild('pass')passInput!:NgModel;
  @ViewChild('email')emailInput!:NgModel;

  handlePassChange(pass: NgModel)
  {
    this.isPassValid.set(!pass.hasError('pattern') && !pass.hasError('required'))
  }
  handleEmailChange(email: NgModel)
  {
    this.isEmailValid.set(!email.hasError('pattern') && !email.hasError('required'))
  }
  async onSignUp() {
    try 
    {
        const user = await this.authService.register(this.userObject().email,this.userObject().password,this.userObject().username);
        console.log("user created with id ", user.user.uid);
    }
    catch(err:any)
    {
      alert("Registeration failed " + err.message);
    }
    
    // authService.register()
    //Validate user input first before calling the auth service
    // if (!this.userObject().username) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Username Required',
    //     text: 'Please enter a username'
    //   });
    //   return;
    // }

    // if (!this.userObject().password) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Password Required',
    //     text: 'Please enter a password'
    //   });
    //   return;
    // }
    // if (!this.userObject().email) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Email Required',
    //     text: 'Please enter an email'
    //   });
    //   return;
    // }
    // if (!this.userObject().confirmPassword) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Password Confirmation Required',
    //     text: 'Please confirm your password'
    //   });
    //   return;
    // }
    // if (this.userObject().password !== this.userObject().confirmPassword) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Password Mismatch',
    //     text: 'Passwords do not match'
    //   });
    //   return;
    // }

    //Call the auth service to add the user
    // const result = this.authService.addUser(this.userObject());
    //If the user is added successfully, navigate to the users list
    // if(!result) {
    //   return;
    // }
    // this.userObject.set({username: "", email: "", password: "", confirmPassword: ""})
    // this.router.navigate(['/usersList']);
  }
}
