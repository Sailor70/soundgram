import { Injectable, NgModule } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Routes, RouterModule } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { UsersComponent } from './users.component';
import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { UserDetailComponent } from 'app/users/user-detail/user-detail.component';

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
  },
  {
    path: 'view',
    component: UserDetailComponent,
    resolve: {
      user: UsersResolve
    },
    data: {
      pageTitle: 'users.title'
    }
  },
  {
    path: ':login/view',
    component: UserDetailComponent,
    resolve: {
      user: UsersResolve
    },
    data: {
      pageTitle: 'users.title'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(USERS_ROUTE)],
  exports: [RouterModule]
})
export class RoutingUsers {}
