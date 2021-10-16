import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'amazing-articles';

  constructor(private _authService: AuthService){}

  logoutUser(){
    this._authService.logoutUser();
  }

  loggedIn(){
    return this._authService.loggedIn();
  }
}
