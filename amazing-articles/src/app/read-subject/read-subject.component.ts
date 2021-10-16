import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../article.service';
import { AuthService } from '../auth.service';
import { Subject } from '../shared/subject.model';
import { UserService } from '../user.service';
import { Location } from '@angular/common';
import { SubjectService } from '../subject.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-read-subject',
  templateUrl: './read-subject.component.html',
  styleUrls: ['./read-subject.component.css']
})
export class ReadSubjectComponent implements OnInit {
  subjectId = "";
  userFollowingList = [];
  subjectInfo:Subject = new Subject();

  // For like/unlike article
  unfollowIcon = 'bookmark_outline';
  followIcon = 'bookmark';
  viewFollowIcon = '';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _subject: SubjectService,
    // private _article: ArticleService,
    private _auth: AuthService,
    private _user: UserService,
    private _location: Location,
    private _clipboard: Clipboard,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // Fetch the subjectId from the url
    this.subjectId = this._route.snapshot.paramMap.get('subjectId');
    
    // Check if user is authenticated
    if(this._auth.loggedIn())
    {
      this._user.fetchUserInfo()
        .subscribe(
          res => {
            this.userFollowingList = res.followingList;
            // console.log(this.userReadingList);
            // Initial state
            if(this.userFollowingList.indexOf(this.subjectId) != -1)
            {
              this.viewFollowIcon = this.followIcon;
            } else {
              this.viewFollowIcon = this.unfollowIcon;
            }
          },
          err => console.log(err),
        );
    } else {
      this.viewFollowIcon = this.unfollowIcon;
    }
    
    // Fetch the subject info from the subject Id
    this._subject.getSubjectInfo(this.subjectId).subscribe(
      res => {
        // If article not found, then goto page not found
        if(res.success != undefined)
        {
          return this._router.navigate(['page-not-found']);
        }
        
        // Converting json object to Subject class object
        this.subjectInfo = new Subject(res);
        this.subjectInfo.coverImagePath = environment.backendUrl + this.subjectInfo.coverImagePath;
        if(this.subjectInfo.userDefined)
        {
          this.subjectInfo.author.profilePicturePath = environment.backendUrl + this.subjectInfo.author.profilePicturePath;
        }

        // console.log(this.subjectInfo);
        this.subjectInfo.articleObjList.forEach((article) => {
          article.coverImagePath = environment.backendUrl + article.coverImagePath;
        });
      },
      err => console.log(err),
    );
  }

  // Go back to previous page
  backToPrevious() {
    this._location.back();
  }

  // For sharing this subject link
  shareSubjectLink(subjectId:string) {
    var shareLink = environment.frontendUrl + "read-subject/" + subjectId;
    this._clipboard.copy(shareLink);
    this.showSnackBar("Link copied to the clipboard");
  }

  // For follow or unfollow subject
  followOrUnfollowSubject() {
    // Check if the user is authenticated or not?
    if(!this._auth.loggedIn())
    {
      return this._router.navigate(['/login']);
    }
    let followCount = this.subjectInfo.followers;
    let snackbarDisplayString : string;
    // If user reading list contains ArticleId then unlike it
    if(this.viewFollowIcon == this.unfollowIcon) {
      this.viewFollowIcon = this.followIcon;
      followCount += 1;
      snackbarDisplayString = "Subject added to your following list";
    } else {
      this.viewFollowIcon = this.unfollowIcon;
      followCount -= 1;
      snackbarDisplayString = "Subject removed from your following list";
    }
    this._subject.followOrUnfollowSubject(this.subjectId, followCount)
      .subscribe(
        res => {
          if(res.success){
            this.subjectInfo.followers = followCount;
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
