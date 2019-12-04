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
      }
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ])
  ]
})
export class SoundgramEntityModule {}
