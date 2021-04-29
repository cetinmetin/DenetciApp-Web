import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, filter, observeOn } from 'rxjs/operators';

import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import firebase from "firebase/app";
import 'firebase/auth'
import "firebase/firestore";
import { User } from "../../models/user";
import { UserService } from "../user.service";

const tokenName = 'token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user: Observable<firebase.User>;
  currentUser: any
  private subject = new BehaviorSubject<User>(undefined);

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    public userService: UserService,

  ) {
    this.user = firebaseAuth.authState;
  }

  async getUserInformation() {
    this.currentUser = await firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).get()
    return this.currentUser.data()
  }

  signInRegular(email: string, password: string) {
    firebase.auth.EmailAuthProvider.credential(
      email,
      password,
    );
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  public logout() {
    this.firebaseAuth.signOut().then((res) => {
      this.router.navigate(["/pages/login"]);
    });
  }

  createUserWithEmailAndPassword(emailID: string, password: string) {
    return this.firebaseAuth.createUserWithEmailAndPassword(emailID, password);
  }

  public get authToken(): string {
    return localStorage.getItem(tokenName);
  }

}
