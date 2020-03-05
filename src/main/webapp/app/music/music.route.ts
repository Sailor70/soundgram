import { ActivatedRouteSnapshot, Resolve, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { MusicComponent } from './music.component';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MusicResolve implements Resolve<Observable<number>> {
  constructor() {}

  resolve(route: ActivatedRouteSnapshot) {
    return route.params['userId'] ? route.params['userId'] : null;
    // console.error('userId: ' + id);
    // return id;
  }
}

export const MUSIC_ROUTE: Routes = [
  {
    path: 'music',
    component: MusicComponent,
    data: {
      authorities: [],
      pageTitle: 'music.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'music/:userId/play',
    component: MusicComponent,
    resolve: {
      userId: MusicResolve
    },
    data: {
      pageTitle: 'music.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
