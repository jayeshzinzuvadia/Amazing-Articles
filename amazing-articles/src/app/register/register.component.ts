import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  errorMsg = '';
  registrationForm: FormGroup;
  // For file upload
  fileToUpload: File | null = null;

  constructor(private fb: FormBuilder, private _auth: AuthService, private _router: Router) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        bio: ['', [Validators.maxLength(80)]],
        dateOfBirth: ['', [Validators.required]],
        profilePicture: File,
        profilePicturePath: [''],
        email: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
      }
    );
  }

  handleFileInput(files: FileList) {
    // this.fileToUpload = files.item(0);
    // Use patch value to update specific form field
    if(files.item(0) != null)
    {
      // Use patch value to update specific form field
      this.registrationForm.patchValue({
        profilePicture : files.item(0),
        profilePicturePath: files.item(0).name,
      });
    }
    // console.log(this.fileToUpload);
  }

  // uploadFileToActivity() {
  //   this._auth.postFile(this.fileToUpload).subscribe(data => {
  //       console.log("File Uploaded Successfully");
  //     }, error => {
  //       console.log(error);
  //     });
  // }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      // If there is some group inside formGroup, then call recursively
      // else if (control instanceof FormGroup) {
      //   this.validateAllFormFields(control);
      // }
    });
  }

  registerUser() 
  {
    if(this.registrationForm.valid)
    {
      console.log(this.registrationForm.value);
      // Envelope the registrationForm data inside formData cover
      const user = this.registrationForm.value;
      const formData: FormData = new FormData();
      formData.append('name', user.name);
      formData.append('bio', user.bio);
      formData.append('dateOfBirth', user.dateOfBirth);
      formData.append('email', user.email);
      formData.append('password', user.password);

      if(user.profilePicture.name === "File") {
        // formData.append('profilePicture', user.profilePicture);
        formData.append('profilePicturePath', 'default.png');
        // console.log(user.profilePicture);
      } else {
        formData.append('profilePicture', user.profilePicture, user.profilePicture.name);
        formData.append('profilePicturePath', user.profilePicturePath);
        console.log("Image uploaded successfully");
      }

      this._auth.registerUser(formData)
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
              this._router.navigate(['/articles']);
            }
          },
          err => console.log(err),
        );
    } else {
      this.errorMsg = 'Please fill out the required fields';
      this.validateAllFormFields(this.registrationForm);
    }
  }

  // Getters
  get name() {
    return this.registrationForm.get('name');
  }

  get bio() {
    return this.registrationForm.get('bio');
  }

  get dateOfBirth() {
    return this.registrationForm.get('dateOfBirth');
  }

  get profilePicturePath() {
    return this.registrationForm.get('profilePicturePath');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password(){
    return this.registrationForm.get('password');
  }

}
