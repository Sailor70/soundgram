import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { ProfileComponent } from './profile.component';

export const PROFILE_ROUTE: Route = {
  path: 'profile',
  component: ProfileComponent,
  data: {
    authorities: [],
    pageTitle: 'profile.title'
  },
  canActivate: [UserRouteAccessService]
};
