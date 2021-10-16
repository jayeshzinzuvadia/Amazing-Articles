import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ArticleService } from '../article.service';
import { Subject } from '../shared/subject.model';
import { SubjectService } from '../subject.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-update-subject',
  templateUrl: './update-subject.component.html',
  styleUrls: ['./update-subject.component.css']
})
export class UpdateSubjectComponent implements OnInit {
  subjectId = "";
  // subjectInfo = new Subject();
  updateSubjectForm: FormGroup;
  
  // For cover image
  sourceImagePath = "";
  fileToUpload: File | null = null;
  errorMsg = "";

  // Form control elements
  get coverImagePath() {
    return this.updateSubjectForm.get('coverImagePath');
  }
  get themeColour() {
    return this.updateSubjectForm.get('themeColour');
  }
  get subjectName() {
    return this.updateSubjectForm.get('subjectName');
  }
  get description() {
    return this.updateSubjectForm.get('description');
  }

  constructor(
    private fb: FormBuilder,
    private _user: UserService,
    private _subject: SubjectService,
    private _router: Router,
    private _route: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  // Handling Expression has changed after it was checked.
  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    // Fetch the subjectId from the url
    this.subjectId = this._route.snapshot.paramMap.get('subjectId');

    // update subject form group
    this.updateSubjectForm = this.fb.group(
      {
        coverImage: File,
        coverImagePath: [''],
        themeColour: ['#00FF00'],
        subjectName: ['', [Validators.required, Validators.maxLength(50)]],
        description: ['', [Validators.required, Validators.maxLength(900)]],
      }
    );

    // Fetch the subject info from the subject Id
    this._subject.getSubjectInfoOnly(this.subjectId).subscribe(
      res => {
        var subjectObj = res.subjectInfo;
        // No other user should update a particular user's article
        this._user.fetchUserInfo().subscribe(
          res => {
            if(res._id != subjectObj.authorId)
            {
              return this._router.navigate(['page-not-found']);
            }
          },
          err => console.log(err),
        );

        // If article not found, then goto page not found
        if(subjectObj.success != undefined)
        {
          return this._router.navigate(['page-not-found']);
        }
        
        // Converting json object to Subject class object
        this.sourceImagePath = environment.backendUrl + subjectObj.coverImagePath;
        // Initialize form group on page load
        this.updateSubjectForm.patchValue(
          {
            coverImagePath: subjectObj.coverImagePath,
            themeColour: subjectObj.themeColour,
            subjectName: subjectObj.subjectName,
            description: subjectObj.description,
          }
        );
      }
    );
  }

  // For saving cover image file
  handleFileInput(files: FileList) {
    if(files.item(0) != null)
    {
      // Use patch value to update specific form field
      this.updateSubjectForm.patchValue({
        coverImage : files.item(0),
        coverImagePath: "",
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

  // update subject method
  updateSubject()
  {
    console.log(this.updateSubjectForm.value);
    console.log("Form validity : " + this.updateSubjectForm.valid);

    if(this.updateSubjectForm.valid)
    {
      const subject = this.updateSubjectForm.value;
      // Envelope the updateSubjectForm data inside formData cover
      const formData: FormData = new FormData();
      if(subject.coverImage.name === "File") {
        formData.append('coverImagePath', subject.coverImagePath);
      } else {
        formData.append('coverImage', subject.coverImage, subject.coverImage.name);
        formData.append('coverImagePath', '');
      }
      formData.append('themeColour', subject.themeColour);
      formData.append('subjectName', subject.subjectName);
      formData.append('description', subject.description);

      this._subject.updateSubjectInfo(this.subjectId, formData)
        .subscribe(
          res => {
            console.log(res);
            if(res['success'] == false)
            {
              this.errorMsg = res['message'];
              return;
            }
            else {
              this._router.navigate(['/my-articles']);
            }
          },
          err => console.log(err),
        );
    }
    else {
      this.errorMsg = 'Please fill out the required fields';
      this.validateAllFormFields(this.updateSubjectForm);
    }
  }

}
