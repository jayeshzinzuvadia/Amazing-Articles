import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ArticleService } from '../article.service';
import { AuthService } from '../auth.service';
import { SubjectService } from '../subject.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.css']
})
export class SavedComponent implements OnInit {
  // For display list of articles
  public savedArticleList = [];
  public viewLikeArticleList = [];
  public articlesFlag: boolean = false;

  // For display list of subjects
  public savedSubjectList = [];
  public viewFollowSubjectList = [];
  public subjectsFlag: boolean = false;

  constructor(
    private _router: Router, 
    private _article: ArticleService,
    private _auth: AuthService,
    private _subject: SubjectService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this._article.getSavedArticleList()
      .subscribe(
        res => {
          this.savedArticleList = res;
          for (let index = 0; index < this.savedArticleList.length; index++) {
            this.viewLikeArticleList.push(this.likeIcon);
            this.savedArticleList[index].coverImagePath = environment.backendUrl + this.savedArticleList[index].coverImagePath;
          }
          if(this.savedArticleList.length == 0)
            this.articlesFlag = false;
          else
            this.articlesFlag = true;
        },
        err => console.log(err),
      );
    
    this._subject.getMySubjectFollowingList()
      .subscribe(
        res => {
          this.savedSubjectList = res;
          for (let index = 0; index < this.savedSubjectList.length; index++) 
          {
            this.viewFollowSubjectList.push(this.followIcon);
            this.savedSubjectList[index].coverImagePath = environment.backendUrl + this.savedSubjectList[index].coverImagePath;
          }
          if(this.savedSubjectList.length == 0)
            this.subjectsFlag = false;
          else
            this.subjectsFlag = true;
        },
        err => console.log(err),
      );
  }

  navigateToReadArticle(articleId: string) {
    this._router.navigate(['/read-article', articleId]);
  }

  navigateToReadSubject(subjectId: string) {
    this._router.navigate(['/read-subject', subjectId]);
  }

  // For like/unlike article
  unlikeIcon = 'favorite_outline';
  likeIcon = 'favorite';
  unlikeArticle(aid:number, article) {
    let snackbarDisplayString: string;
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }
    let likeCount = article.likes;
    if(this.viewLikeArticleList[aid] === this.likeIcon)
    {
      this.viewLikeArticleList[aid] = this.unlikeIcon;
      likeCount -= 1;
      snackbarDisplayString = "Article removed from your reading list";
    }
    this._article.likeOrUnlikeArticle(article._id, likeCount)
      .subscribe(
        res => {
          if(res.success){
            article.likes = likeCount;
            if(aid != -1) {
              this.savedArticleList.splice(aid, 1);
              this.viewLikeArticleList.splice(aid, 1);
            }
            if(this.savedArticleList.length == 0) {
              this.articlesFlag = false;
            }
            this.showSnackBar(snackbarDisplayString);
          } else {
            console.log(res.message);
          }
        },
        err => console.error(err),
      );
  }

  // For follow/unfollow article
  unfollowIcon = 'bookmark_outline';
  followIcon = 'bookmark';
  unfollowSubject(sid:number, subject) {
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }

    let followCount = subject.followers;
    let snackbarDisplayString: string;
    if(this.viewFollowSubjectList[sid] === this.followIcon) 
    {
      this.viewFollowSubjectList[sid] = this.unfollowIcon;
      followCount -= 1;
      snackbarDisplayString = "Subject removed from your following list";
    }

    this._subject.followOrUnfollowSubject(subject._id, followCount)
      .subscribe(
        res => {
          if(res.success)
          {
            subject.followers = followCount;
            if(sid != -1) 
            {
              this.savedSubjectList.splice(sid, 1);
              this.viewFollowSubjectList.splice(sid, 1);
            }
            if(this.savedSubjectList.length == 0) 
            {
              this.subjectsFlag = false;
            }
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

}
