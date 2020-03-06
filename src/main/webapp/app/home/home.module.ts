import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
import { PostObjectModule } from 'app/shared/postObject/post-object.module';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forChild([HOME_ROUTE]), PostObjectModule],
  declarations: [HomeComponent]
})
export class SoundgramHomeModule {}
