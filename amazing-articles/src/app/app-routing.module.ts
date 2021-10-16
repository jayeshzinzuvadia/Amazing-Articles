import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticlesComponent } from './articles/articles.component';
import { AuthGuard } from './auth.guard';
import { CreateArticleComponent } from './create-article/create-article.component';
import { CreateSubjectComponent } from './create-subject/create-subject.component';
import { DiscoverComponent } from './discover/discover.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MyArticlesComponent } from './my-articles/my-articles.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { ReadArticleComponent } from './read-article/read-article.component';
import { ReadSubjectComponent } from './read-subject/read-subject.component';
import { RegisterComponent } from './register/register.component';
import { SavedComponent } from './saved/saved.component';
import { SubjectsComponent } from './subjects/subjects.component';
import { UpdateArticleComponent } from './update-article/update-article.component';
import { UpdateSubjectComponent } from './update-subject/update-subject.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'articles',
    component: ArticlesComponent,
  },
  {
    path: 'discover',
    component: DiscoverComponent,
  },
  {
    path: 'subjects',
    component: SubjectsComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'read-article/:articleId',
    component: ReadArticleComponent,
  },
  {
    path: 'read-subject/:subjectId',
    component: ReadSubjectComponent,
  },
  {
    path: 'create-article',
    component: CreateArticleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'create-subject',
    component: CreateSubjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'saved',
    component: SavedComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'my-articles',
    component: MyArticlesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update-article/:articleId',
    component: UpdateArticleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update-subject/:subjectId',
    component: UpdateSubjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
