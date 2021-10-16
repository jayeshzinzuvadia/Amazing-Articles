import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService 
{
  private CREATE_SUBJECT_URL = environment.backendUrl + "subject/create/";
  private GET_ALL_SUBJECTS_URL = environment.backendUrl + "subject/all/";
  private GET_SUBJECT_LIST_FOR_ARTICLE_URL = environment.backendUrl + "subject/subjectListForArticle/";
  private GET_MY_SUBJECT_LIST_URL = environment.backendUrl + "subject/mySubjectList/";
  private GET_MY_SUBJECT_FOLLOWING_LIST_URL = environment.backendUrl + "subject/mySubjectFollowingList/";
  private GET_SUBJECT_INFO_URL = environment.backendUrl + "subject/readSubject/";
  private GET_SUBJECT_INFO_ONLY_URL = environment.backendUrl + "subject/readSubjectOnly/";
  private UPDATE_SUBJECT_INFO_URL = environment.backendUrl + "subject/update/";
  private DELETE_SUBJECT_INFO_URL = environment.backendUrl + "subject/delete/";
  private FOLLOW_OR_UNFOLLOW_SUBJECT_URL = environment.backendUrl + "subject/followOrUnfollow/";
  private SEARCH_SUBJECTS_OR_ARTICLES = environment.backendUrl + "search";

  constructor(private http: HttpClient) { }

  createSubject(newSubject) {
    return this.http.post<any>(this.CREATE_SUBJECT_URL, newSubject);
  }

  getAllSubjects() {
    return this.http.get<any>(this.GET_ALL_SUBJECTS_URL);
  }

  getSubjectListForArticle() {
    return this.http.get<any>(this.GET_SUBJECT_LIST_FOR_ARTICLE_URL);
  }

  getMySubjectList() {
    return this.http.get<any>(this.GET_MY_SUBJECT_LIST_URL);
  }

  getMySubjectFollowingList() {
    return this.http.get<any>(this.GET_MY_SUBJECT_FOLLOWING_LIST_URL);
  }

  getSubjectInfo(subjectId){
    return this.http.get<any>(this.GET_SUBJECT_INFO_URL + subjectId);
  }

  getSubjectInfoOnly(subjectId) {
    return this.http.get<any>(this.GET_SUBJECT_INFO_ONLY_URL + subjectId);
  }

  updateSubjectInfo(subjectId, updatedSubjectObj) {
    return this.http.put<any>(this.UPDATE_SUBJECT_INFO_URL + subjectId, updatedSubjectObj);
  }

  deleteSubjectInfo(subjectId) {
    return this.http.delete<any>(this.DELETE_SUBJECT_INFO_URL + subjectId);
  }

  followOrUnfollowSubject(subjectId, followersCount) {
    return this.http.put<any>(this.FOLLOW_OR_UNFOLLOW_SUBJECT_URL + subjectId, {followers: followersCount});
  }

  getSearchListOfArticlesAndSubjects() {
    return this.http.get<any>(this.SEARCH_SUBJECTS_OR_ARTICLES);
  }

}
