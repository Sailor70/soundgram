import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostObjectComponent } from 'app/shared/postObject/post-object.component';
import { PostPlayerComponent } from './post-player.component';
import { PostCommentsComponent } from './post-comments.component';
import { SoundgramSharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PostObjectComponent, PostPlayerComponent, PostCommentsComponent],
  exports: [PostObjectComponent],
  imports: [CommonModule, SoundgramSharedModule, RouterModule]
})
export class PostObjectModule {}
