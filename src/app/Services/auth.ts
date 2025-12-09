import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  registeredUsers: Array<{ username: string; email: string; password: string }> = [];

  addUser(newUser: { username: string; email: string; password: string }): boolean {
    if (this.checkUserIfNotExist(newUser.username)) {
      this.registeredUsers.push(newUser);
      return true;
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Username Exists',
        text: 'Sorry, this username account already exists!'
      });
      return false;
    }
  }

  getAllUsers() {
    return this.registeredUsers;
  }

  checkUserIfNotExist(username: string) {
    if (this.registeredUsers.find((user) => user.username === username)) {
      return false;
    }
    return true;
  }

  deleteUserService(username: string) {
    this.registeredUsers = this.registeredUsers.filter((user) => user.username !== username);
  }

}
