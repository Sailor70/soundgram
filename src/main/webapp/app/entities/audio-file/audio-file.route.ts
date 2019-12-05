import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from './audio-file.service';
import { AudioFileComponent } from './audio-file.component';
import { AudioFileDetailComponent } from './audio-file-detail.component';
import { AudioFileUpdateComponent } from './audio-file-update.component';
import { IAudioFile } from 'app/shared/model/audio-file.model';

@Injectable({ providedIn: 'root' })
export class AudioFileResolve implements Resolve<IAudioFile> {
  constructor(private service: AudioFileService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAudioFile> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(map((audioFile: HttpResponse<AudioFile>) => audioFile.body));
    }
    return of(new AudioFile());
  }
}

export const audioFileRoute: Routes = [
  {
    path: '',
    component: AudioFileComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.audioFile.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: AudioFileDetailComponent,
    resolve: {
      audioFile: AudioFileResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.audioFile.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: AudioFileUpdateComponent,
    resolve: {
      audioFile: AudioFileResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.audioFile.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: AudioFileUpdateComponent,
    resolve: {
      audioFile: AudioFileResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'soundgramApp.audioFile.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
