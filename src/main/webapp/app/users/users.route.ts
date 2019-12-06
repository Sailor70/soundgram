import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { UsersComponent } from './users.component';
import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
//import { UsersDetailComponent } from 'app/users/users-detail/users-detail.component';

@Injectable({ providedIn: 'root' })
export class UsersResolve implements Resolve<any> {
  constructor(private service: UserService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.params['login'] ? route.params['login'] : null;
    if (id) {
      return this.service.find(id);
    }
    return new User();
  }
}

export const USERS_ROUTE: Routes = [
  {
    path: 'users',
    component: UsersComponent,
    data: {
      authorities: [],
      pageTitle: 'users.title'
    },
    canActivate: [UserRouteAccessService]
  }

  /*
  uncomment when UsersDetail created
  {
    path: 'view',
    component: UsersDetailComponent,
    resolve: {
      user: UsersResolve
    },
    data: {
      pageTitle: 'search-users.title'
    }
  },
  {
    path: ':login/view',
    component: UsersDetailComponent,
    resolve: {
      user: UsersResolve
    },
    data: {
      pageTitle: 'search-users.title'
    }
  }*/
];
