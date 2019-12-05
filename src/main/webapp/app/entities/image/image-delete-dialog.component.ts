import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IImage } from 'app/shared/model/image.model';
import { ImageService } from './image.service';

@Component({
  templateUrl: './image-delete-dialog.component.html'
})
export class ImageDeleteDialogComponent {
  image: IImage;

  constructor(protected imageService: ImageService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(id: number) {
    this.imageService.delete(id).subscribe(() => {
      this.eventManager.broadcast({
        name: 'imageListModification',
        content: 'Deleted an image'
      });
      this.activeModal.dismiss(true);
    });
  }
}
