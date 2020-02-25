import { NgModule } from '@angular/core';

import { SoundgramSharedModule } from 'app/shared/shared.module';
import { CommentComponent } from './comment.component';
import { CommentDetailComponent } from './comment-detail.component';
import { CommentUpdateComponent } from './comment-update.component';
import { CommentDeleteDialogComponent } from './comment-delete-dialog.component';
import { routingComments } from './comment.route';

@NgModule({
  imports: [SoundgramSharedModule, routingComments],
  declarations: [CommentComponent, CommentDetailComponent, CommentUpdateComponent, CommentDeleteDialogComponent],
  entryComponents: [CommentDeleteDialogComponent],
  exports: [CommentDeleteDialogComponent]
})
export class SoundgramCommentModule {}
