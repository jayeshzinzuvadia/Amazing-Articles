import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private PROFILE_URL = "http://localhost:3000/user/profile/";
  private UPDATE_URL = "http://localhost:3000/user/update/";
  private DELETE_URL = "http://localhost:3000/user/delete/";

  constructor(private http: HttpClient, private _auth: AuthService) { }

  fetchUserInfo() {
    return this.http.get<any>(this.PROFILE_URL);
  }

  updateUserInfo(updatedUser) {
    return this.http.put<any>(this.UPDATE_URL, updatedUser);
  }

  deleteUserAccount() {
    return this.http.delete<any>(this.DELETE_URL);
  }
}
