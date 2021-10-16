import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubjectService } from '../subject.service';

@Component({
  selector: 'app-create-subject',
  templateUrl: './create-subject.component.html',
  styleUrls: ['./create-subject.component.css']
})
export class CreateSubjectComponent implements OnInit {
  errorMsg = '';
  createSubjectForm: FormGroup;
  // For cover image
  fileToUpload: File | null = null;

  // Form control elements
  get coverImagePath() {
    return this.createSubjectForm.get('coverImagePath');
  }
  get themeColour() {
    return this.createSubjectForm.get('themeColour');
  }
  get subjectName() {
    return this.createSubjectForm.get('subjectName');
  }
  get description() {
    return this.createSubjectForm.get('description');
  }

  constructor(private fb: FormBuilder, 
    private _subject: SubjectService, 
    private _router: Router) { }

  ngOnInit(): void {
    // create subject form group
    this.createSubjectForm = this.fb.group(
      {
        coverImage: File,
        coverImagePath: ['', [Validators.required]],
        themeColour: ['#00FF00'],
        subjectName: ['', [Validators.required, Validators.maxLength(50)]],
        description: ['', [Validators.required, Validators.maxLength(900)]],
      }
    );
  }

  // For saving cover image file
  // listen for image status
  handleFileInput(files: FileList) {
    if(files.item(0) != null)
    {
      // Use patch value to update specific form field
      this.createSubjectForm.patchValue({
        coverImage : files.item(0),
        coverImagePath: files.item(0).name,
      });
    }
  }

  // Validate form fields
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  // create subject method
  createSubject()
  {
    console.log(this.createSubjectForm.value);
    console.log("Form validity : " + this.createSubjectForm.valid);

    if(this.createSubjectForm.valid)
    {
      const subject = this.createSubjectForm.value;
      // Envelope the createSubjectForm data inside formData cover
      const formData: FormData = new FormData();
      if(subject.coverImage.name != "File") {
        console.log('File uploaded successfully');
        formData.append('coverImage', subject.coverImage, subject.coverImage.name);
        formData.append('coverImagePath', subject.coverImage.name);
      }
      formData.append('themeColour', subject.themeColour);
      formData.append('subjectName', subject.subjectName);
      formData.append('description', subject.description);
      // temporary
      // change userDefined to false when creating permanent subject
      formData.append('userDefined', "true");
      formData.append('authorId', "");

      this._subject.createSubject(formData)
        .subscribe(
          res => {
            console.log(res);
            if(res['success'] == false)
            {
              this.errorMsg = res['message'];
              return;
            }
            else {
              this._router.navigate(['/articles']);
            }
          },
          err => console.log(err),
        );
    }
    else {
      this.errorMsg = 'Please fill out the required fields';
      this.validateAllFormFields(this.createSubjectForm);
    }
  }

}
