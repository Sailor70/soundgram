import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from '../shared/shared.module';

import { USERS_ROUTE, UsersComponent } from './';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { SoundgramCommentModule } from 'app/entities/comment/comment.module';
import { CommentDeleteDialogComponent } from 'app/entities/comment/comment-delete-dialog.component';

@NgModule({
  imports: [SoundgramSharedModule, SoundgramCommentModule, RouterModule.forRoot(USERS_ROUTE)], // RouterModule.forRoot([USERS_ROUTE], { useHash: true })
  declarations: [UsersComponent, UserDetailComponent],
  entryComponents: [CommentDeleteDialogComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoundgramAppUsersModule {}
