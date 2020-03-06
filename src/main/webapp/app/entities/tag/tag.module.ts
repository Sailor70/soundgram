import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from 'app/shared/shared.module';
import { TagComponent } from './tag.component';
import { TagDetailComponent } from './tag-detail.component';
import { TagUpdateComponent } from './tag-update.component';
import { TagDeleteDialogComponent } from './tag-delete-dialog.component';
import { tagRoute } from './tag.route';
import { PostObjectModule } from 'app/shared/postObject/post-object.module';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forChild(tagRoute), PostObjectModule],
  declarations: [TagComponent, TagDetailComponent, TagUpdateComponent, TagDeleteDialogComponent],
  entryComponents: [TagDeleteDialogComponent]
})
export class SoundgramTagModule {}
