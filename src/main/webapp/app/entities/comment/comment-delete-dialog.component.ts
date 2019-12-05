import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IComment } from 'app/shared/model/comment.model';
import { CommentService } from './comment.service';

@Component({
  templateUrl: './comment-delete-dialog.component.html'
})
export class CommentDeleteDialogComponent {
  comment: IComment;

  constructor(protected commentService: CommentService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(id: number) {
    this.commentService.delete(id).subscribe(() => {
      this.eventManager.broadcast({
        name: 'commentListModification',
        content: 'Deleted an comment'
      });
      this.activeModal.dismiss(true);
    });
  }
}
