import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FollowedUser } from 'app/shared/model/followed-user.model';
import { FollowedUserService } from './followed-user.service';
import { FollowedUserComponent } from './followed-user.component';
import { FollowedUserDetailComponent } from './followed-user-detail.component';
import { FollowedUserUpdateComponent } from './followed-user-update.component';
import { IFollowedUser } from 'app/shared/model/followed-user.model';

@Injectable({ providedIn: 'root' })
export class FollowedUserResolve implements Resolve<IFollowedUser> {
  constructor(private service: FollowedUserService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IFollowedUser> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(map((followedUser: HttpResponse<FollowedUser>) => followedUser.body));
    }
    return of(new FollowedUser());
  }
}

export const followedUserRoute: Routes = [
  {
    path: '',
    component: FollowedUserComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.followedUser.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: FollowedUserDetailComponent,
    resolve: {
      followedUser: FollowedUserResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.followedUser.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: FollowedUserUpdateComponent,
    resolve: {
      followedUser: FollowedUserResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.followedUser.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: FollowedUserUpdateComponent,
    resolve: {
      followedUser: FollowedUserResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.followedUser.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
