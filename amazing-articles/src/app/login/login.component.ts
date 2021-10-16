import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMsg = '';
  passwordErrFlag = false;
  emailErrFlag = false;

  loginForm = {
    email: "",
    password: "",
  }

  constructor(private _auth: AuthService, private _router: Router) { }

  ngOnInit(): void {
  }

  validateEmail(email) {
    if(!this.isEmptyString(email)){
      this.emailErrFlag = false;
    }
  }

  validatePassword(password) {
    if(!this.isEmptyString(password)){
      this.passwordErrFlag = false;
    }
  }

  validateLoginForm() {
    this.emailErrFlag = this.isEmptyString(this.loginForm.email);
    this.passwordErrFlag = this.isEmptyString(this.loginForm.password);
    console.log(this.loginForm);
    // If there is any error in email or password then return false
    if(this.emailErrFlag || this.passwordErrFlag)
    {
      return false;
    }
    return true;
  }

  isEmptyString(str:string) {
    return (!str || str.length === 0);
  };

  loginUser(userForm) {
    // Validate login fields
    if(this.validateLoginForm() == false)
    {
      return false;
    }
    console.log(userForm);
    // Sent request to the server
    try{
      this._auth.loginUser(this.loginForm)
        .subscribe(
          res => {
            console.log(res);
            if(res['success'] == false)
            {
              this.errorMsg = res['message'];
              return;
            }
            else {
              localStorage.setItem('token', res.token);
              // Redirect to the home page for correct email and password
              this._router.navigate(['/articles']);
            }
          },
          err => {
            console.log(err);
            this.errorMsg = 'Incorrect email or password. Try Again.';
          }
        );
    } catch(err) {
      console.log(err);
    }
  }
}
