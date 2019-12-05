import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IImage } from 'app/shared/model/image.model';
import { ImageService } from './image.service';
import { ImageDeleteDialogComponent } from './image-delete-dialog.component';

@Component({
  selector: 'jhi-image',
  templateUrl: './image.component.html'
})
export class ImageComponent implements OnInit, OnDestroy {
  images: IImage[];
  eventSubscriber: Subscription;
  currentSearch: string;

  constructor(
    protected imageService: ImageService,
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
      this.imageService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IImage[]>) => (this.images = res.body));
      return;
    }
    this.imageService.query().subscribe((res: HttpResponse<IImage[]>) => {
      this.images = res.body;
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
    this.registerChangeInImages();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IImage) {
    return item.id;
  }

  registerChangeInImages() {
    this.eventSubscriber = this.eventManager.subscribe('imageListModification', () => this.loadAll());
  }

  delete(image: IImage) {
    const modalRef = this.modalService.open(ImageDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.image = image;
  }
}
