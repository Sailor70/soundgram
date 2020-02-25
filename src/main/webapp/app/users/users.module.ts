import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SoundgramSharedModule } from '../shared/shared.module';

import { RoutingUsers, UsersComponent } from './';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { CommentDeleteDialogComponent } from 'app/entities/comment/comment-delete-dialog.component';
import { SoundgramCommentModule } from 'app/entities/comment/comment.module';

@NgModule({
  imports: [SoundgramSharedModule, RoutingUsers, SoundgramCommentModule], // RouterModule.forRoot([USERS_ROUTE], { useHash: true })
  declarations: [UsersComponent, UserDetailComponent],
  entryComponents: [CommentDeleteDialogComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoundgramAppUsersModule {}
