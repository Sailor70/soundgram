import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IFollowedUser } from 'app/shared/model/followed-user.model';
import { FollowedUserService } from './followed-user.service';
import { FollowedUserDeleteDialogComponent } from './followed-user-delete-dialog.component';

@Component({
  selector: 'jhi-followed-user',
  templateUrl: './followed-user.component.html'
})
export class FollowedUserComponent implements OnInit, OnDestroy {
  followedUsers: IFollowedUser[];
  eventSubscriber: Subscription;
  currentSearch: string;

  constructor(
    protected followedUserService: FollowedUserService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  loadAll() {
    if (this.currentSearch) {
      this.followedUserService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IFollowedUser[]>) => (this.followedUsers = res.body));
      return;
    }
    this.followedUserService.query().subscribe((res: HttpResponse<IFollowedUser[]>) => {
      this.followedUsers = res.body;
      this.currentSearch = '';
    });
  }

  search(query) {
    if (!query) {
      return this.clear();
    }
    this.currentSearch = query;
    this.loadAll();
  }

  clear() {
    this.currentSearch = '';
    this.loadAll();
  }

  ngOnInit() {
    this.loadAll();
    this.registerChangeInFollowedUsers();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IFollowedUser) {
    return item.id;
  }

  registerChangeInFollowedUsers() {
    this.eventSubscriber = this.eventManager.subscribe('followedUserListModification', () => this.loadAll());
  }

  delete(followedUser: IFollowedUser) {
    const modalRef = this.modalService.open(FollowedUserDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.followedUser = followedUser;
  }
}
