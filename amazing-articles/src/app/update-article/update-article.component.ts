import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { AbstractControl, FormArray, FormArrayName, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../article.service';
import { SubjectService } from '../subject.service';
import { environment } from 'src/environments/environment';
import { Article } from '../shared/article.model';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-update-article',
  templateUrl: './update-article.component.html',
  styleUrls: ['./update-article.component.css']
})
export class UpdateArticleComponent implements OnInit {
  articleId = "";
  articleInfo = new Article();
  updateArticleForm: FormGroup;
  // For cover image
  sourceImagePath = "";
  fileToUpload: File | null = null;
  errorMsg = "";

  // Form control elements
  get coverImagePath() {
    return this.updateArticleForm.get('coverImagePath');
  }
  get themeColour() {
    return this.updateArticleForm.get('themeColour');
  }
  get title() {
    return this.updateArticleForm.get('title');
  }
  get shortIntro() {
    return this.updateArticleForm.get('shortIntro');
  }
  get subject() {
    return this.updateArticleForm.get('subject');
  }
  get tags() {
    return this.updateArticleForm.get('tags') as FormArray;
  }
  get content() {
    return this.updateArticleForm.get('content');
  }
  get readingTime() {
    return this.updateArticleForm.get('readingTime');
  }
  get references() {
    return this.updateArticleForm.get('references') as FormArray;
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

  constructor(
    private fb: FormBuilder, 
    private _user: UserService,
    private _article: ArticleService,
    private _subject: SubjectService,
    private _router: Router,
    private _route: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }
  
  // Handling Expression has changed after it was checked.
  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    // Fetch the articleId from the url
    this.articleId = this._route.snapshot.paramMap.get('articleId');

    // update article form group
    this.updateArticleForm = this.fb.group(
      {
        coverImage: File,
        coverImagePath: [''],
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

    // Fetch the article info from the article Id
    this._article.getArticleInfo(this.articleId).subscribe(articleObj => {
      // No other user should update a particular user's article
      this._user.fetchUserInfo().subscribe(
        res => {
          if(res._id != articleObj.authorId) {
            return this._router.navigate(['page-not-found']);
          }
        },
        err => console.log(err),
      );

      // If article not found, then goto page not found
      if(articleObj.success != undefined)
      {
        return this._router.navigate(['page-not-found']);
      }

      // Converting json object to Article class object
      this.articleInfo = new Article(articleObj);
      this.sourceImagePath = environment.backendUrl + articleObj.coverImagePath;
      console.log(this.articleInfo);

      // Initialize form group on page load
      this.updateArticleForm.patchValue(
        {
          coverImagePath: this.articleInfo.coverImagePath,
          themeColour: this.articleInfo.themeColour,
          title: this.articleInfo.title,
          subjectId: this.articleInfo.subjectId,
          subject: this.articleInfo.subject,
          shortIntro: this.articleInfo.shortIntro,
          content: this.articleInfo.content,
          readingTime: this.articleInfo.readingTime,
        }
      );
      this.subjectControl.setValue(this.articleInfo.subject);
      this.articleInfo.tags.forEach((tag) => {
        this.tags.push(this.fb.control(tag));
      });
      this.articleInfo.references.forEach((refs) => {
        this.references.push(this.fb.control(refs));
      });
      // Find better approach for passing content to child's content editable
      document.getElementById('texteditor').innerHTML = this.content.value;
    });

    // Initializing Subject List Logic
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
  }

  // Data logic

  // For saving cover image file
  handleFileInput(files: FileList) {
    if(files.item(0) != null)
    {
      // Use patch value to update specific form field
      this.updateArticleForm.patchValue({
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
    // for subject
    this.subjectControl.markAsTouched({onlySelf: true});
  }

  // create article method
  updateArticle(childTextEditor)
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

    this.updateArticleForm.patchValue({
      subjectId: this.selectedSubjectId,
      subject: this.subjectControl.value,
      content: childTextEditor.getTextData(),
    });

    console.log(this.updateArticleForm.value);
    console.log("Form validity : " + this.updateArticleForm.valid);

    if(this.updateArticleForm.valid)
    {
      const article = this.updateArticleForm.value;

      // Envelope the updateArticleForm data inside formData cover
      const formData: FormData = new FormData();
      if(article.coverImage.name === "File") {
        formData.append('coverImagePath', article.coverImagePath);
      } else {
        formData.append('coverImage', article.coverImage, article.coverImage.name);
        formData.append('coverImagePath', '');
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

      this._article.updateArticleInfo(this.articleId, formData)
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
      this.validateAllFormFields(this.updateArticleForm);
    }
  }

}
