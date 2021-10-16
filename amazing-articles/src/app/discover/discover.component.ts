import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { SubjectService } from '../subject.service';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {
  public subjectList = [];
  public userFollowingList = [];
  public viewFollowSubjectList = [];
  // For search feature
  searchString = '';

  searchList:any[];

  constructor(
    private _router: Router, 
    private _subject: SubjectService,
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
            this.userFollowingList = res.followingList;
            // console.log(this.userFollowingList);
          },
          err => console.log(err),
        );
    }

    this._subject.getAllSubjects()
        .subscribe(
          res => {
            this.subjectList = res;
            this.subjectList.forEach((subject) => {
              // Updating coverImagePath for getting image data from server folder 
              subject.coverImagePath = environment.backendUrl + subject.coverImagePath;              // For view purpose of like/unlike subject
              if(this._auth.loggedIn()) 
              {
                if(this.userFollowingList.indexOf(subject._id) != -1) {
                  // User has followed this subject
                  this.viewFollowSubjectList.push(this.followIcon);
                } else {
                  // User has not followed this subject
                  this.viewFollowSubjectList.push(this.unfollowIcon);
                }
              } else {
                for (let index = 0; index < this.subjectList.length; index++) {
                  this.viewFollowSubjectList.push(this.unfollowIcon);
                }
              }
            });
          },
          err => console.log(err),
        );

    // For search feature
    this._subject.getSearchListOfArticlesAndSubjects()
        .subscribe(
          res => {
            this.searchList = res.searchList;            
          }
        );
  }

  navigateToReadSubject(subjectId: string){
    this._router.navigate(['/read-subject', subjectId]);
  }

  navigateToSearchItem(searchItem) {
    let searchItemTypeURL = '/read-subject';
    if(searchItem.type == 'Article')
    {
      searchItemTypeURL = '/read-article';
    }
    this._router.navigate([searchItemTypeURL, searchItem._id]);
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
    let snackbarDisplayString : string;
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
