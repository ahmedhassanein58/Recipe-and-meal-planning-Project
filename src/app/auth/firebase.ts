import { Injectable,Inject, signal } from '@angular/core';
import { firebaseConfig } from '../../firebase.config';
import { initializeApp } from 'firebase/app';
import { setDoc,doc, getFirestore} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { getAuth,createUserWithEmailAndPassword, onAuthStateChanged,signInWithEmailAndPassword} from 'firebase/auth';
import { Signout } from '../Components/signout/signout';
@Injectable({
  providedIn: 'root',
})
export class Firebase {
  app = initializeApp(firebaseConfig);
  auth = getAuth(this.app);
  db = getFirestore(this.app)
  user = signal<any>(null)

  
  constructor()
  {
    onAuthStateChanged(this.auth,(user) => {
      this.user.set(user)
    })
  }
  async register(email:string,password:string, name: string)
  {
    try
    {
        const userCred = await createUserWithEmailAndPassword(this.auth,email,password);
        setDoc(doc(this.db,'/users', userCred.user.uid), {
          username: name,
          email: email
        })
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
  async logout()
  {
    try 
    {
      const logout = await signOut(this.auth)
    }
    catch(err:any)
    {
      
    }
  }
}
