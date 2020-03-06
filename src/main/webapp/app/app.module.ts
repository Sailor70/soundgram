import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import './vendor';
import { SoundgramSharedModule } from 'app/shared/shared.module';
import { SoundgramCoreModule } from 'app/core/core.module';
import { SoundgramAppRoutingModule } from './app-routing.module';
import { SoundgramHomeModule } from './home/home.module';
import { SoundgramEntityModule } from './entities/entity.module';
import { SoundgramAppUsersModule } from './users/users.module';
import { SoundgramAppProfileModule } from './profile/profile.module';
import { SoundgramAppMusicModule } from './music/music.module';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { JhiMainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
import { ErrorComponent } from './layouts/error/error.component';
import { PostObjectModule } from './shared/postObject/post-object.module';

@NgModule({
  imports: [
    BrowserModule,
    SoundgramSharedModule,
    SoundgramCoreModule,
    SoundgramHomeModule,
    SoundgramAppUsersModule,
    SoundgramAppProfileModule,
    SoundgramAppMusicModule,
    // jhipster-needle-angular-add-module JHipster will add new module here
    SoundgramEntityModule,
    SoundgramAppRoutingModule,
    PostObjectModule
  ],
  declarations: [JhiMainComponent, NavbarComponent, ErrorComponent, PageRibbonComponent, ActiveMenuDirective, FooterComponent],
  bootstrap: [JhiMainComponent]
})
export class SoundgramAppModule {}
