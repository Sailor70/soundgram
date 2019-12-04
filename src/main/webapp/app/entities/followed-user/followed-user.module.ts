import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from 'app/shared/shared.module';
import { FollowedUserComponent } from './followed-user.component';
import { FollowedUserDetailComponent } from './followed-user-detail.component';
import { FollowedUserUpdateComponent } from './followed-user-update.component';
import { FollowedUserDeleteDialogComponent } from './followed-user-delete-dialog.component';
import { followedUserRoute } from './followed-user.route';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forChild(followedUserRoute)],
  declarations: [FollowedUserComponent, FollowedUserDetailComponent, FollowedUserUpdateComponent, FollowedUserDeleteDialogComponent],
  entryComponents: [FollowedUserDeleteDialogComponent]
})
export class SoundgramFollowedUserModule {}
