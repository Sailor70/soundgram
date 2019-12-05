import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'user-extra',
        loadChildren: () => import('./user-extra/user-extra.module').then(m => m.SoundgramUserExtraModule)
      },
      {
        path: 'followed-user',
        loadChildren: () => import('./followed-user/followed-user.module').then(m => m.SoundgramFollowedUserModule)
      },
      {
        path: 'tag',
        loadChildren: () => import('./tag/tag.module').then(m => m.SoundgramTagModule)
      },
      {
        path: 'post',
        loadChildren: () => import('./post/post.module').then(m => m.SoundgramPostModule)
      },
      {
        path: 'comment',
        loadChildren: () => import('./comment/comment.module').then(m => m.SoundgramCommentModule)
      },
      {
        path: 'image',
        loadChildren: () => import('./image/image.module').then(m => m.SoundgramImageModule)
      }
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ])
  ]
})
export class SoundgramEntityModule {}
