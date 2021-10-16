import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { AbstractControl, FormArray, FormArrayName, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { Router } from '@angular/router';
import { ArticleService } from '../article.service';
import { SubjectService } from '../subject.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-article',
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.css']
})
export class CreateArticleComponent implements OnInit, AfterViewChecked  {

  errorMsg = '';
  createArticleForm: FormGroup;
  // For cover image
  fileToUpload: File | null = null;

  // Form control elements
  get coverImagePath() {
    return this.createArticleForm.get('coverImagePath');
  }
  get themeColour() {
    return this.createArticleForm.get('themeColour');
  }
  get title() {
    return this.createArticleForm.get('title');
  }
  get shortIntro() {
    return this.createArticleForm.get('shortIntro');
  }
  get subject() {
    return this.createArticleForm.get('subject');
  }
  get tags() {
    return this.createArticleForm.get('tags') as FormArray;
  }
  get content() {
    return this.createArticleForm.get('content');
  }
  get readingTime() {
    return this.createArticleForm.get('readingTime');
  }
  get references() {
    return this.createArticleForm.get('references') as FormArray;
  }

  // UI design logic
  
  // For tag chips
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [COMMA] as const;
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our chips
    if (value) {
      // console.log(this.tags);
      this.tags.push(this.fb.control(value));
    }
    // Clear the input value
    event.input.value = "";
  }
  remove(chips: FormControl): void {
    const index = this.tags.controls.indexOf(chips);
    if (index >= 0) {
      this.tags.removeAt(index);
    }
  }

  // For subject autocomplete
  subjectControl = new FormControl('', [Validators.maxLength(50)]);
  subjectIdList : string[] = [];
  subjectNameList : string[] = [];
  selectedSubjectId = "";
  filteredOptions: Observable<string[]>;
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.subjectNameList.filter(option => option.toLowerCase().includes(filterValue));
  }

  // For adding reference fields
  addReference() {
    this.references.push(this.fb.control(''));
  }
  removeReference(index) {
    if (index > -1) {
      this.references.removeAt(index);
    }
  }

  // data from child component : Not working with contenteditable
  // contentData = "";
  // childEvent(event) {
  //   this.contentData = event;
  //   console.log('Inside child event');
  // }

  constructor(
    private fb: FormBuilder, 
    private _article: ArticleService,
    private _subject: SubjectService,
    private _router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef) { }
  
  // Handling Expression has changed after it was checked.
  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    this._subject.getSubjectListForArticle().subscribe(
      res => {
        res.forEach(doc => {
          this.subjectIdList.push(doc._id);
          this.subjectNameList.push(doc.subjectName);
        });
        console.log(res);
      },
      err => console.log(err),
    );

    // For displaying subjects list from backend to UI
    this.filteredOptions = this.subjectControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    // create article form group
    this.createArticleForm = this.fb.group(
      {
        coverImage: File,
        coverImagePath: ['', [Validators.required]],
        themeColour: ['#FF8000'],
        title: ['', [Validators.required, Validators.maxLength(70)]],
        subjectId: [''],
        subject: ['', [Validators.required, Validators.maxLength(50)]],
        shortIntro: ['', [Validators.maxLength(180)]],
        tags: this.fb.array([]),
        content: ['', [Validators.required]],
        readingTime: ['', [Validators.required, Validators.min(2), Validators.max(45)]],
        references:  this.fb.array([]),
      }
    );
  }

  // Data logic

  // For saving cover image file
  // listen for image status
  handleFileInput(files: FileList) {
    if(files.item(0) != null)
    {
      // Use patch value to update specific form field
      this.createArticleForm.patchValue({
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
    // for subject
    this.subjectControl.markAsTouched({onlySelf: true});
  }

  // create article method
  createArticle(childTextEditor)
  {
    let subId = this.subjectNameList.indexOf(this.subjectControl.value);
    if(subId == -1)
    {
      // Means subject is typed out of the subjectList
      this.selectedSubjectId = environment.noSubjectId;
    }
    else 
    {
      this.selectedSubjectId = this.subjectIdList[subId];
    }

    this.createArticleForm.patchValue({
      subjectId: this.selectedSubjectId,
      subject: this.subjectControl.value,
      content: childTextEditor.getTextData(),
    });

    console.log(this.createArticleForm.value);
    console.log("Form validity : " + this.createArticleForm.valid);

    if(this.createArticleForm.valid)
    {
      const article = this.createArticleForm.value;
      // Envelope the createArticleForm data inside formData cover
      const formData: FormData = new FormData();
      if(article.coverImage.name != "File") {
        console.log('File uploaded successfully');
        formData.append('coverImage', article.coverImage, article.coverImage.name);
        formData.append('coverImagePath', article.coverImage.name);
      }
      formData.append('themeColour', article.themeColour);
      formData.append('title', article.title);
      formData.append('subjectId', article.subjectId);
      formData.append('subject', article.subject);
      formData.append('shortIntro', article.shortIntro);
      formData.append('tags', article.tags);
      formData.append('content', article.content);
      formData.append('readingTime', article.readingTime);
      formData.append('references', article.references);

      this._article.createArticle(formData)
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
      this.validateAllFormFields(this.createArticleForm);
    }
  }
}
