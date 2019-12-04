import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IFollowedUser } from 'app/shared/model/followed-user.model';
import { FollowedUserService } from './followed-user.service';

@Component({
  templateUrl: './followed-user-delete-dialog.component.html'
})
export class FollowedUserDeleteDialogComponent {
  followedUser: IFollowedUser;

  constructor(
    protected followedUserService: FollowedUserService,
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager
  ) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(id: number) {
    this.followedUserService.delete(id).subscribe(() => {
      this.eventManager.broadcast({
        name: 'followedUserListModification',
        content: 'Deleted an followedUser'
      });
      this.activeModal.dismiss(true);
    });
  }
}
