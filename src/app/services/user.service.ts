import { Injectable } from "@angular/core";
import { AngularFireDatabase, AngularFireList, AngularFireObject } from "@angular/fire/database";

import { User } from "../models/user";

@Injectable()
export class UserService {
  selectedUser: User = new User();
  users: AngularFireList<User>;
  user: AngularFireObject<User>;
  location = {
    lat: null,
    lon: null,
  };

  constructor(private db: AngularFireDatabase) {
    this.getUsers();
  }

  getUsers() {
    this.users = this.db.list("clients");
    return this.users;
  }

  getUser(id: string) {
  }

  createUser(data: any) {
    const updatedData = {
      ...data,
      isAdmin: false,
    };
    this.users.push(updatedData);
  }

  isAdmin(emailId: string) {
    return this.db.list("clients", (ref) =>
      ref.orderByChild("email").equalTo(emailId)
    );
  }

  updateUser(user: User) {
    this.users.update(user.$key, user);
  }

  setLocation(lat: any, lon: any) {
    this.location = { lat, lon };
  }
}
