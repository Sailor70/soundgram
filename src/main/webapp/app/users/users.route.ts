import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { UsersComponent } from './users.component';

export const USERS_ROUTE: Route = {
  path: 'users',
  component: UsersComponent,
  data: {
    authorities: [],
    pageTitle: 'users.title'
  },
  canActivate: [UserRouteAccessService]
};
