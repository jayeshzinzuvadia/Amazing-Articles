import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ArticlesComponent } from './articles/articles.component';
import { DiscoverComponent } from './discover/discover.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SavedComponent } from './saved/saved.component';
import { ProfileComponent } from './profile/profile.component';
import { MyArticlesComponent } from './my-articles/my-articles.component';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { TokenInterceptorService } from './token-interceptor.service';
import { CreateArticleComponent } from './create-article/create-article.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { ReadArticleComponent } from './read-article/read-article.component';
import { CreateSubjectComponent } from './create-subject/create-subject.component';
import { ReadSubjectComponent } from './read-subject/read-subject.component';
import { SubjectsComponent } from './subjects/subjects.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TextSelectDirective } from './text-select.directive';
import { UpdateArticleComponent } from './update-article/update-article.component';
import { UpdateSubjectComponent } from './update-subject/update-subject.component';

// For search feature in discover
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ArticlesComponent,
    DiscoverComponent,
    SavedComponent,
    ProfileComponent,
    MyArticlesComponent,
    CreateArticleComponent,
    TextEditorComponent,
    ReadArticleComponent,
    CreateSubjectComponent,
    ReadSubjectComponent,
    SubjectsComponent,
    PageNotFoundComponent,
    TextSelectDirective,
    UpdateArticleComponent,
    UpdateSubjectComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    Ng2SearchPipeModule,
  ],
  providers: [
    AuthService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
