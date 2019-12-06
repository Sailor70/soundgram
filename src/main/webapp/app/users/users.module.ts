import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from '../shared/shared.module';

import { USERS_ROUTE, UsersComponent } from './';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forRoot([USERS_ROUTE], { useHash: true })],
  declarations: [UsersComponent],
  entryComponents: [],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoundgramAppUsersModule {}
