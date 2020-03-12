import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from 'app/shared/shared.module';
import { PostComponent } from './post.component';
import { PostDetailComponent } from './post-detail.component';
import { PostUpdateComponent } from './post-update.component';
import { PostDeleteDialogComponent } from './post-delete-dialog.component';
import { postRoute } from './post.route';
import { PostObjectModule } from 'app/shared/postObject/post-object.module';
import { PostNewComponent } from './post-new/post-new.component';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forChild(postRoute), PostObjectModule],
  declarations: [PostComponent, PostDetailComponent, PostUpdateComponent, PostDeleteDialogComponent, PostNewComponent],
  entryComponents: [PostDeleteDialogComponent]
})
export class SoundgramPostModule {}
