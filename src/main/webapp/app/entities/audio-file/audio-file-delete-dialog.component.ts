import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from './audio-file.service';

@Component({
  templateUrl: './audio-file-delete-dialog.component.html'
})
export class AudioFileDeleteDialogComponent {
  audioFile: IAudioFile;

  constructor(protected audioFileService: AudioFileService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(id: number) {
    this.audioFileService.delete(id).subscribe(() => {
      this.eventManager.broadcast({
        name: 'audioFileListModification',
        content: 'Deleted an audioFile'
      });
      this.activeModal.dismiss(true);
    });
  }
}
