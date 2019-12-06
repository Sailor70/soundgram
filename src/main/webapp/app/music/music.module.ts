import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from '../shared/shared.module';

import { MUSIC_ROUTE, MusicComponent } from './';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forRoot([MUSIC_ROUTE], { useHash: true })],
  declarations: [MusicComponent],
  entryComponents: [],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoundgramAppMusicModule {}
