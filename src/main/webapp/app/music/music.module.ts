import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from '../shared/shared.module';

import { MUSIC_ROUTE, MusicComponent, MusicResolve } from './';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forRoot(MUSIC_ROUTE, { useHash: true })],
  declarations: [MusicComponent],
  entryComponents: [],
  providers: [MusicResolve], // to i exports właściwie niepotrzebne
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoundgramAppMusicModule {}
