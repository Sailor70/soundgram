import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IUserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from './user-extra.service';
import { UserExtraDeleteDialogComponent } from './user-extra-delete-dialog.component';

@Component({
  selector: 'jhi-user-extra',
  templateUrl: './user-extra.component.html'
})
export class UserExtraComponent implements OnInit, OnDestroy {
  userExtras: IUserExtra[];
  eventSubscriber: Subscription;
  currentSearch: string;

  constructor(
    protected userExtraService: UserExtraService,
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
      this.userExtraService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IUserExtra[]>) => (this.userExtras = res.body));
      return;
    }
    this.userExtraService.query().subscribe((res: HttpResponse<IUserExtra[]>) => {
      this.userExtras = res.body;
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
    this.registerChangeInUserExtras();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IUserExtra) {
    return item.id;
  }

  registerChangeInUserExtras() {
    this.eventSubscriber = this.eventManager.subscribe('userExtraListModification', () => this.loadAll());
  }

  delete(userExtra: IUserExtra) {
    const modalRef = this.modalService.open(UserExtraDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.userExtra = userExtra;
  }
}
