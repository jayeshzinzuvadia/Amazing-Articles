import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs/tab-group';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ArticleService } from '../article.service';
import { AuthService } from '../auth.service';
import { SubjectService } from '../subject.service';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-articles',
  templateUrl: './my-articles.component.html',
  styleUrls: ['./my-articles.component.css']
})
export class MyArticlesComponent implements OnInit {
  // For display list of articles
  public myArticleList = [];
  public readingList = [];
  public viewLikeArticleList = [];
  public articlesFlag: boolean = false;

  // For display list of subjects
  public mySubjectList = [];
  public followingList = [];
  public viewFollowSubjectList = [];
  public subjectsFlag: boolean = false;

  constructor(
    private _router: Router, 
    private _article: ArticleService,
    private _auth: AuthService,
    private _user: UserService,
    private _subject: SubjectService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // Fetching logged in user info
    this._user.fetchUserInfo()
      .subscribe(
        res => {
          this.readingList = res.readingList;
          this.followingList = res.followingList;
        },
        err => console.log(err),
      );
    
    // For articles
    this._article.getMyArticleList()
      .subscribe(
        res => {
          this.myArticleList = res;
          // For view purpose only
          if(this.myArticleList.length == 0)
            this.articlesFlag = false;
          else
            this.articlesFlag = true;

          // Loop over articles list
          for (let index = 0; index < this.myArticleList.length; index++) {
            this.myArticleList[index].coverImagePath = environment.backendUrl + this.myArticleList[index].coverImagePath;
            // For view purpose of like/unlike article
            if(this.readingList.indexOf(this.myArticleList[index]._id) != -1) {
              // Means user has liked this article
              this.viewLikeArticleList.push(this.likeIcon);
            } else {
              // User has not liked this article
              this.viewLikeArticleList.push(this.unlikeIcon);
            }
          }
        },
        err => console.log(err),
      );

    // For subjects
    this._subject.getMySubjectList()
      .subscribe(
        res => {
          this.mySubjectList = res;
          // For view purpose only
          if(this.mySubjectList.length == 0)
            this.subjectsFlag = false;
          else
            this.subjectsFlag = true;

          // Loop over articles list
          for (let index = 0; index < this.mySubjectList.length; index++) {
            this.mySubjectList[index].coverImagePath = environment.backendUrl + this.mySubjectList[index].coverImagePath;
            // For view purpose of follow/unfollow subject
            if(this.followingList.indexOf(this.mySubjectList[index]._id) != -1) {
              // Means user has followed this subject
              this.viewFollowSubjectList.push(this.followIcon);
            } else {
              // User has not followed this subject
              this.viewFollowSubjectList.push(this.unfollowIcon);
            }
          }
        },
        err => console.log(err),
      );
  }

  // Managing tabs
  index = 0;
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.index = tabChangeEvent.index;
  }

  // Read article
  navigateToReadArticle(articleId: string) {
    this._router.navigate(['/read-article', articleId]);
  }

  // Read subject
  navigateToReadSubject(subjectId: string) {
    this._router.navigate(['/read-subject', subjectId]);
  }

  // Update article
  navigateToUpdateArticle(articleId: string) {
    this._router.navigate(['/update-article', articleId]);
  }

  // Update subject
  navigateToUpdateSubject(subjectId: string) {
    this._router.navigate(['/update-subject', subjectId]);
  }

  // Delete article
  deleteArticle(aid: number, articleId: string) 
  {
    console.log("aid : ", aid);
    this._article.deleteArticleInfo(articleId)
      .subscribe(
        res => {
          if(res.success){
            if(aid != -1) {
              this.myArticleList.splice(aid, 1);
              this.viewLikeArticleList.splice(aid, 1);
              this.showSnackBar("Article deleted successfully!");
            }
          } else {
            console.log(res.message);
          }
        },
        err => console.error(err),
      );
  }

  // Delete subject
  deleteSubject(sid: number, subjectId: string) 
  {
    console.log("subjectId : ", subjectId);
    console.log("SID : ", sid);
    this._subject.deleteSubjectInfo(subjectId)
      .subscribe(
        res => {
          if(res.success){
            if(sid != -1) {
              this.mySubjectList.splice(sid, 1);
              this.viewFollowSubjectList.splice(sid, 1);
              this.showSnackBar("Subject deleted successfully!");
            }
          } else {
            console.log(res.message);
          }
        },
        err => console.error(err),
      );
  }

  // For like/unlike article
  unlikeIcon = 'favorite_outline';
  likeIcon = 'favorite';
  likeOrUnlikeArticle(aid:number, article) {
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }
    let likeCount = article.likes;
    let snackbarDisplayString:string;
    if(this.viewLikeArticleList[aid] === this.unlikeIcon) 
    {
      this.viewLikeArticleList[aid] = this.likeIcon;
      likeCount += 1;
      snackbarDisplayString = "Article added to your reading list";
    }
    else
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
  followOrUnfollowSubject(sid:number, subject) {
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }

    let followCount = subject.followers;
    let snackbarDisplayString:string;
    if(this.viewFollowSubjectList[sid] === this.unfollowIcon) 
    {
      this.viewFollowSubjectList[sid] = this.followIcon;
      followCount += 1;
      snackbarDisplayString = "Subject added to your following list";
    }
    else
    {
      this.viewFollowSubjectList[sid] = this.unfollowIcon;
      followCount -= 1;
      snackbarDisplayString = "Subject removed from your following list";
    }

    this._subject.followOrUnfollowSubject(subject._id, followCount)
      .subscribe(
        res => {
          if(res.success){
            subject.followers = followCount;
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
