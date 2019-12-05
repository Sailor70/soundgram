import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comment } from 'app/shared/model/comment.model';
import { CommentService } from './comment.service';
import { CommentComponent } from './comment.component';
import { CommentDetailComponent } from './comment-detail.component';
import { CommentUpdateComponent } from './comment-update.component';
import { IComment } from 'app/shared/model/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentResolve implements Resolve<IComment> {
  constructor(private service: CommentService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IComment> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(map((comment: HttpResponse<Comment>) => comment.body));
    }
    return of(new Comment());
  }
}

export const commentRoute: Routes = [
  {
    path: '',
    component: CommentComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.comment.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: CommentDetailComponent,
    resolve: {
      comment: CommentResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.comment.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: CommentUpdateComponent,
    resolve: {
      comment: CommentResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.comment.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: CommentUpdateComponent,
    resolve: {
      comment: CommentResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.comment.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
