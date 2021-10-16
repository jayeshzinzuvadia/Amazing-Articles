import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private CREATE_ARTICLE_URL = environment.backendUrl + "article/create/";
  private GET_ALL_ARTICLES_URL = environment.backendUrl + "article/all/";
  private GET_RANDOM_N_ARTICLES_URL = environment.backendUrl + "article/";
  private GET_MY_ARTICLE_LIST_URL = environment.backendUrl + "article/myArticleList/";
  private GET_SAVED_ARTICLE_LIST_URL = environment.backendUrl + "article/saved/";
  private GET_ARTICLE_INFO_URL = environment.backendUrl + "article/readArticle/";
  private LIKE_OR_UNLIKE_ARTICLE_URL = environment.backendUrl + "article/likeOrUnlike/";
  private UPDATE_ARTICLE_INFO_URL = environment.backendUrl + "article/update/";
  private DELETE_ARTICLE_INFO_URL = environment.backendUrl + "article/delete/";
  private ADD_COMMENT_URL = environment.backendUrl + "article/addComment/";
  private DICTIONARY_URL = environment.backendUrl + "dictionary/";

  constructor(private http: HttpClient, private _router: Router) { }

  createArticle(newArticle) {
    return this.http.post<any>(this.CREATE_ARTICLE_URL, newArticle);
  }

  getAllArticles() {
    return this.http.get<any>(this.GET_ALL_ARTICLES_URL);
  }

  getRandomNArticles() {
    return this.http.get<any>(this.GET_RANDOM_N_ARTICLES_URL);
  }

  getMyArticleList() {
    return this.http.get<any>(this.GET_MY_ARTICLE_LIST_URL);
  }

  getSavedArticleList() {
    return this.http.get<any>(this.GET_SAVED_ARTICLE_LIST_URL);
  }

  getArticleInfo(articleId){
    return this.http.get<any>(this.GET_ARTICLE_INFO_URL + articleId);
  }

  updateArticleInfo(articleId, updatedArticleObj) {
    return this.http.put<any>(this.UPDATE_ARTICLE_INFO_URL + articleId, updatedArticleObj);
  }

  deleteArticleInfo(articleId) {
    return this.http.delete<any>(this.DELETE_ARTICLE_INFO_URL + articleId);
  }

  likeOrUnlikeArticle(articleId, likeCount) {
    return this.http.put<any>(this.LIKE_OR_UNLIKE_ARTICLE_URL + articleId, {likes: likeCount});
  }

  addComment(articleId, message: string) {
    return this.http.put<any>(this.ADD_COMMENT_URL + articleId, {message: message});
  }

  getWordInfoFromDictionary(selectedWord:string) {
    return this.http.get<any>(this.DICTIONARY_URL + selectedWord);
  }



}
