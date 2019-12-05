import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ITag } from 'app/shared/model/tag.model';
import { TagService } from './tag.service';
import { TagDeleteDialogComponent } from './tag-delete-dialog.component';

@Component({
  selector: 'jhi-tag',
  templateUrl: './tag.component.html'
})
export class TagComponent implements OnInit, OnDestroy {
  tags: ITag[];
  eventSubscriber: Subscription;
  currentSearch: string;

  constructor(
    protected tagService: TagService,
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
      this.tagService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<ITag[]>) => (this.tags = res.body));
      return;
    }
    this.tagService.query().subscribe((res: HttpResponse<ITag[]>) => {
      this.tags = res.body;
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
    this.registerChangeInTags();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: ITag) {
    return item.id;
  }

  registerChangeInTags() {
    this.eventSubscriber = this.eventManager.subscribe('tagListModification', () => this.loadAll());
  }

  delete(tag: ITag) {
    const modalRef = this.modalService.open(TagDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.tag = tag;
  }
}
