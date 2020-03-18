import { NgModule } from '@angular/core';
import { SoundgramSharedLibsModule } from './shared-libs.module';
import { FindLanguageFromKeyPipe } from './language/find-language-from-key.pipe';
import { JhiAlertComponent } from './alert/alert.component';
import { JhiAlertErrorComponent } from './alert/alert-error.component';
import { JhiLoginModalComponent } from './login/login.component';
import { HasAnyAuthorityDirective } from './auth/has-any-authority.directive';
import { ScrollTopComponent } from 'app/shared/util/scroll-top/scroll-top.component';

@NgModule({
  imports: [SoundgramSharedLibsModule],
  declarations: [
    FindLanguageFromKeyPipe,
    JhiAlertComponent,
    JhiAlertErrorComponent,
    JhiLoginModalComponent,
    HasAnyAuthorityDirective,
    ScrollTopComponent
  ],
  entryComponents: [JhiLoginModalComponent],
  exports: [
    SoundgramSharedLibsModule,
    FindLanguageFromKeyPipe,
    JhiAlertComponent,
    JhiAlertErrorComponent,
    JhiLoginModalComponent,
    HasAnyAuthorityDirective,
    ScrollTopComponent
  ]
})
export class SoundgramSharedModule {}
