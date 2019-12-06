import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { MusicComponent } from './music.component';

export const MUSIC_ROUTE: Route = {
  path: 'music',
  component: MusicComponent,
  data: {
    authorities: [],
    pageTitle: 'music.title'
  },
  canActivate: [UserRouteAccessService]
};
