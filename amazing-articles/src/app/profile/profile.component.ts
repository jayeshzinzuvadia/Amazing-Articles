import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // display purpose
  viewUserInfo = {};
  profilePictureURL : string = "";
  profilePictureOriginal : string = "";

  // update form
  updateProfileForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private _user: UserService, 
    private _auth: AuthService,
    private _router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {    
    this.updateProfileForm = this.fb.group({
      bio: [''],
      updateProfilePicture: File,
      profilePicturePath: [''],
    });

    // fetching user's profile data from the server
    this._user.fetchUserInfo().subscribe(
      res => {
        // view purpose
        this.viewUserInfo = res;
        this.profilePictureURL = environment.backendUrl + res.profilePicturePath;
        this.profilePictureOriginal = res.profilePicturePath;
        // update form
        this.updateProfileForm.patchValue({
          bio: res.bio,
        });
        console.log(res);
      },
      err => {
        console.error("Exception caught: " + err);
      },
    );
  }

  handleFileInput(files: FileList) {
    this.updateProfileForm.patchValue({
      updateProfilePicture: files.item(0),
    });
  }

  updateUserInfo() 
  {
    if(this.updateProfileForm.valid)
    {
      // console.log(this.updateProfileForm.value);
      const user = this.updateProfileForm.value;
      const formData: FormData = new FormData();

      // formData.append('userId', user.userId);
      formData.append('bio', user.bio);
      // if user has not updated the profile picture, then keep the earlier picture
      if(user.updateProfilePicture.name === "File") 
      {
        formData.append('profilePicturePath', this.profilePictureOriginal);
      } 
      else 
      {
        formData.append('updateProfilePicture', user.updateProfilePicture, user.updateProfilePicture.name);
        formData.append('profilePicturePath', '');
      }

      console.log(formData);

      this._user.updateUserInfo(formData)
        .subscribe(
          res => {
            console.log(res);
            if(res['success'] == false)
            {
              console.log(res['message']);
              return;
            }
            else 
            {
              // Added so as to display the latest profile picture to the user
              // window.location.reload();
              this.showSnackBar('Profile updated successfully!');
              this._router.navigate(['/profile']);
            }
          },
          err => console.error(err),
        );
    }
  }

  deleteUserAccount() {
    this._user.deleteUserAccount().subscribe(
      res => {
        console.log(res);
        this._auth.logoutUser();
        return;
      },
      err => {
        console.log("Error while deletion: " + err);
      }
    );
  }

  // Design Logic
  snackbarStatus = false;
  snackBarRef : MatSnackBarRef<TextOnlySnackBar>;
  showSnackBar(displayStr) {
    this.snackBarRef = this.snackBar.open(displayStr, 'Close', {duration: 3000, panelClass: ['text-khaki', 'j-input-dark'], horizontalPosition: 'left'});
    this.snackBarRef.afterDismissed().subscribe(() => {
      console.log('The snack-bar was dismissed');
    });
    this.snackBarRef.onAction().subscribe(() => {
      console.log('The snack-bar action was triggered!');
    });
  }
  
}