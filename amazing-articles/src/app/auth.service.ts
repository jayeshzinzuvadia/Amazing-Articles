import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
// import { map, catchError } from 'rxjs/operators';
// import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private REGISTER_URL = "http://localhost:3000/user/register/";
  private LOGIN_URL = "http://localhost:3000/user/login/";

  constructor(private http: HttpClient, private _router: Router) { }

  // postFile(fileToUpload: File): Observable<boolean> {
  //   const endpoint = 'http://localhost:3000/user/upload/';
  //   const formData: FormData = new FormData();
  //   formData.append('fileKey', fileToUpload, fileToUpload.name);
  //   return this.http
  //     .post(endpoint, formData, {headers: {'enctype': 'multipart/form-data'}})
  //     .pipe(map(() => { return true; }))
  //     .pipe(catchError(this.errorHandler));
  // }

  // errorHandler(error: HttpErrorResponse) {
  //   return throwError(error);
  // }

  registerUser(user) {
    return this.http.post<any>(this.REGISTER_URL, user);
  }

  loginUser(user){
    return this.http.post<any>(this.LOGIN_URL, user);
  }

  loggedIn() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logoutUser(){
    localStorage.removeItem('token');
    this._router.navigate(['/home']);
  }
}
