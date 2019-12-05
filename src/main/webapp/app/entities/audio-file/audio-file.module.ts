import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SoundgramSharedModule } from 'app/shared/shared.module';
import { AudioFileComponent } from './audio-file.component';
import { AudioFileDetailComponent } from './audio-file-detail.component';
import { AudioFileUpdateComponent } from './audio-file-update.component';
import { AudioFileDeleteDialogComponent } from './audio-file-delete-dialog.component';
import { audioFileRoute } from './audio-file.route';

@NgModule({
  imports: [SoundgramSharedModule, RouterModule.forChild(audioFileRoute)],
  declarations: [AudioFileComponent, AudioFileDetailComponent, AudioFileUpdateComponent, AudioFileDeleteDialogComponent],
  entryComponents: [AudioFileDeleteDialogComponent]
})
export class SoundgramAudioFileModule {}
