import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ArticleService } from '../article.service';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  // For display list of articles
  public articleList = [];
  public userReadingList = [];
  public viewLikeArticleList = [];

  constructor(
    private _router: Router, 
    private _article: ArticleService, 
    private _user: UserService,
    private _auth: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if(this._auth.loggedIn())
    {
      this._user.fetchUserInfo()
        .subscribe(
          res => {
            this.userReadingList = res.readingList;
            // console.log(this.userReadingList);
          },
          err => console.log(err),
        );
    }

    this._article.getRandomNArticles()
        .subscribe(
          res => {
            this.articleList = res;
            this.articleList.forEach((article) => {
              // updating coverImagePath for getting image data from server folder
              article.coverImagePath = environment.backendUrl + article.coverImagePath;
              // For view purpose of like/unlike article
              if(this._auth.loggedIn()) {
                if(this.userReadingList.indexOf(article._id) != -1) {
                  // Means user has liked this article
                  this.viewLikeArticleList.push(this.likeIcon);
                } else {
                  // User has not liked this article
                  this.viewLikeArticleList.push(this.unlikeIcon);
                }
              } else {
                for (let index = 0; index < this.articleList.length; index++) {
                  this.viewLikeArticleList.push(this.unlikeIcon);
                }
              }
            });
          },
          err => console.log(err),
        );
  }

  navigateToCreateArticle() {
    this._router.navigate(['/create-article']);
  }

  navigateToReadArticle(articleId: string) {
    this._router.navigate(['/read-article', articleId]);
  }

  // For like/unlike article
  unlikeIcon = 'favorite_outline';
  likeIcon = 'favorite';

  likeOrUnlikeArticle(aid:number, article) 
  {
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }
    let likeCount = article.likes;
    let snackbarDisplayString: string;
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

  // Snackbar Design Logic
  snackbarStatus = false;
  snackBarRef : MatSnackBarRef<TextOnlySnackBar>;
  showSnackBar(displayStr:string) {
    this.snackBarRef = this.snackBar.open(displayStr, 'Close', {duration: 3000, panelClass: ['text-khaki', 'j-input-dark'], horizontalPosition: 'left'});
  }

}
