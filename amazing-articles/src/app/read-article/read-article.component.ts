import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ArticleService } from '../article.service';
import { AuthService } from '../auth.service';
import { Article } from '../shared/article.model';
import { Dictionary } from '../shared/dictionary.model';
import { TextSelectEvent } from '../text-select.directive';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

interface SelectionRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-read-article',
  templateUrl: './read-article.component.html',
  styleUrls: ['./read-article.component.css']
})
export class ReadArticleComponent implements OnInit {
  articleId = "";
  userReadingList = [];
  articleInfo:Article = new Article();

  // For like/unlike article
  unlikeIcon = 'favorite_outline';
  likeIcon = 'favorite';
  viewLikeIcon = '';

  // For comments
  commentsForm: FormGroup;
  get message() {
    return this.commentsForm.get('message');
  }

  // For dictionary
  public hostRectangle: SelectionRectangle | null;
  public viewPortRect: SelectionRectangle | null;
	private selectedText: string;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _article: ArticleService,
    private _auth: AuthService,
    private _user: UserService,
    private fb: FormBuilder,
    private _location: Location,
    private _clipboard: Clipboard,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    this.hostRectangle = null;
		this.selectedText = "";
  }

  ngOnInit(): void {
    // Fetch the articleId from the url
    this.articleId = this._route.snapshot.paramMap.get('articleId');

    if(this._auth.loggedIn())
    {
      this._user.fetchUserInfo()
        .subscribe(
          res => {
            this.userReadingList = res.readingList;
            // console.log(this.userReadingList);
            // Initial state
            if(this.userReadingList.indexOf(this.articleId) != -1)
            {
              this.viewLikeIcon = this.likeIcon;
            } else {
              this.viewLikeIcon = this.unlikeIcon;
            }
          },
          err => console.log(err),
        );
    } else {
      this.viewLikeIcon = this.unlikeIcon;
    }

    // Fetch the article info from the article Id
    this._article.getArticleInfo(this.articleId).subscribe(articleObj => {
      // If article not found, then goto page not found
      if(articleObj.success != undefined)
      {
        return this._router.navigate(['page-not-found']);
      }
      // Converting json object to Article class object
      this.articleInfo = new Article(articleObj);
      this.articleInfo.coverImagePath = environment.backendUrl + articleObj.coverImagePath;
      this.articleInfo.author.profilePicturePath = environment.backendUrl + this.articleInfo.author.profilePicturePath;
      console.log(this.articleInfo);
      this.articleInfo.comments.forEach((comment) => {
        comment.userProfilePicturePath = environment.backendUrl + comment.userProfilePicturePath;
      });

      // For displaying HTML content using innerHTML
      var divContentTag = document.getElementById('displayContent');
      divContentTag.innerHTML += this.articleInfo.content;
    });

    // Creating a comments form
    this.commentsForm = this.fb.group({
      message: ['', Validators.required],
    });
  }

  // Go back to previous page
  backToPrevious() {
    this._location.back();
  }

  // For sharing this article link
  shareArticleLink(articleId:string) {
    var shareLink = environment.frontendUrl + "read-article/" + articleId;
    this._clipboard.copy(shareLink);
    this.showSnackBar("Link copied to the clipboard");
  }

  // For like or unlike article
  likeOrUnlikeArticle() {
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }
    let likeCount = this.articleInfo.likes;
    let snackbarDisplayString : string;
    // If user reading list contains ArticleId then unlike it
    if(this.viewLikeIcon == this.unlikeIcon) {
      this.viewLikeIcon = this.likeIcon;
      likeCount += 1;
      snackbarDisplayString = "Article added to your reading list";
    } else {
      this.viewLikeIcon = this.unlikeIcon;
      likeCount -= 1;
      snackbarDisplayString = "Article removed from your reading list";
    }
    this._article.likeOrUnlikeArticle(this.articleId, likeCount)
      .subscribe(
        res => {
          if(res.success){
            this.articleInfo.likes = likeCount;
            this.showSnackBar(snackbarDisplayString);
          } else {
            console.log(res.message);
          }
        },
        err => console.error(err),
      );
  }

  // Snackbar Design Logic
  snackbarStatus = false;
  snackBarRef : MatSnackBarRef<TextOnlySnackBar>;
  showSnackBar(displayStr:string) {
    this.snackBarRef = this.snackBar.open(displayStr, 'Close', {duration: 3000, panelClass: ['text-khaki', 'j-input-dark'], horizontalPosition: 'left'});
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

  // For comments
  addComment() {
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }
    if(this.commentsForm.valid)
    {
      this._article.addComment(this.articleId, this.message.value)
        .subscribe(
          res => {
            if(res.success){
              res.newCommentObj.userProfilePicturePath = environment.backendUrl + res.newCommentObj.userProfilePicturePath;
              this.articleInfo.comments.push(res.newCommentObj);
              this.commentsForm.patchValue({
                message: "",
              });
            } else {
              console.log(res.message);
            }
          },
          err => console.error(err),
        );
    } else {
      // Report error message
      this.validateAllFormFields(this.commentsForm);
    }
  }

  // For dictionary
  wordDict: Dictionary = new Dictionary();
  public renderRectangles( event: TextSelectEvent ) : void {
    // Fetch meaning of the word from dictionary
    if(event.text != "" && event.hostRectangle)
    {
      this._article.getWordInfoFromDictionary(event.text).subscribe(
        res => {
          if(res.success)
          {
            this.wordDict = new Dictionary(res.data);
          }
          else
          {
            this.wordDict = new Dictionary();
            this.wordDict.message = res.message;
          }
          console.log(this.wordDict);
        },
        err => console.log(err),
      );
    }

    // Printer
		console.group( "Text Select Event" );
		console.log( "Text:", event.text );
		console.log( "Viewport Rectangle:", event.viewportRectangle );
		console.log( "Host Rectangle:", event.hostRectangle );
		console.groupEnd();
		
    // If a new selection has been created, the viewport and host rectangles will
		// exist. Or, if a selection is being removed, the rectangles will be null.
		if ( event.hostRectangle ) {
      this.hostRectangle = event.hostRectangle;
			this.selectedText = event.text;
      this.viewPortRect = event.viewportRectangle;
		} else {
			this.hostRectangle = null;
			this.selectedText = " ";
      this.viewPortRect = null;
		} 
	}
  // Play audio
  playAudio(src) {
    console.log("Audio called");
    var audio = new Audio(src);
    audio.play();
  }

  public shareSelection() : void {
		console.group( "Shared Text" );
		console.log( this.selectedText );
		console.groupEnd();

		// Now that we've shared the text, let's clear the current selection.
		document.getSelection().removeAllRanges();
		// CAUTION: In modern browsers, the above call triggers a "selectionchange"
		// event, which implicitly calls our renderRectangles() callback. However,
		// in IE, the above call doesn't appear to trigger the "selectionchange"
		// event. As such, we need to remove the host rectangle explicitly.
		this.hostRectangle = null;
		this.selectedText = "";
	}
}