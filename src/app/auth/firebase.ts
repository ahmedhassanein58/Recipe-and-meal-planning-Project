import { Injectable,Inject } from '@angular/core';
import { firebaseConfig } from '../../firebase.config';
import { initializeApp } from 'firebase/app';
import { setDoc,doc, getFirestore} from 'firebase/firestore';
import { getAuth,createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import { email } from '@angular/forms/signals';
@Injectable({
  providedIn: 'root',
})
export class Firebase {
  app = initializeApp(firebaseConfig);
  auth = getAuth(this.app);
  async register(email:string,password:string)
  {
    try
    {
        const userCred = await createUserWithEmailAndPassword(this.auth,email,password);
        return userCred;
    }
    catch(error: any)
    {
      console.log("error registering user: ", error.code, error.message);
      throw error;
    }
  }
  async login(email:string,password:string)
  {
    const userCred = await signInWithEmailAndPassword(this.auth,email,password)
    return userCred
  }
  catch(err:any)
  {
    alert(`User not found. ${err.message} , ${err.code}`)
    throw err
  }
}
