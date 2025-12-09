import { Component, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { Firebase } from '../../auth/firebase';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  imports: [FormsModule,Navbar],
  styleUrl: './login.css',
})
export class Login {
  constructor(private router: Router, private authService: Firebase){};

  userObject = model({
    email: "",
    password: ""
  })

  color = signal('blue')
  message = signal('Please Wait we are logging you in')
  showAlert = signal(false)
  isSubmission = signal(false)

  async onLogin() 
  {
    this.color.set('blue')
    this.message.set('Please Wait we are logging you in')
    this.showAlert.set(true)
    this.isSubmission.set(true)

    try 
    {
      const userCred = await this.authService.login(this.userObject().email,this.userObject().password);
      const user = userCred.user
      console.log(user)
    }
    catch(err:any)
    {
      this.color.set('red')
      this.message.set('Error occure please try again.')
      this.isSubmission.set(false)
      return;
    }
    this.color.set('green');
    this.message.set('you are logged.')
    this.isSubmission.set(false)
    //Validate user input dirst before calling the auth service
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
  }

}
