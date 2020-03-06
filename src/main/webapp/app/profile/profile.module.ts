import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from '../shared/shared.module';

import { PROFILE_ROUTE, ProfileComponent } from './';
import { PostDeleteDialogComponent } from 'app/entities/post/post-delete-dialog.component';
import { SoundgramPostModule } from 'app/entities/post/post.module';
import { PostObjectModule } from 'app/shared/postObject/post-object.module';

@NgModule({
  imports: [SoundgramSharedModule, SoundgramPostModule, RouterModule.forRoot([PROFILE_ROUTE], { useHash: true }), PostObjectModule],
  declarations: [ProfileComponent],
  entryComponents: [PostDeleteDialogComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoundgramAppProfileModule {}
