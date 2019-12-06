import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from '../shared/shared.module';

import { PROFILE_ROUTE, ProfileComponent } from './';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forRoot([PROFILE_ROUTE], { useHash: true })],
  declarations: [ProfileComponent],
  entryComponents: [],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoundgramAppProfileModule {}
