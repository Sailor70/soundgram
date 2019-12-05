import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from './audio-file.service';
import { AudioFileDeleteDialogComponent } from './audio-file-delete-dialog.component';

@Component({
  selector: 'jhi-audio-file',
  templateUrl: './audio-file.component.html'
})
export class AudioFileComponent implements OnInit, OnDestroy {
  audioFiles: IAudioFile[];
  eventSubscriber: Subscription;
  currentSearch: string;

  constructor(
    protected audioFileService: AudioFileService,
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
      this.audioFileService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IAudioFile[]>) => (this.audioFiles = res.body));
      return;
    }
    this.audioFileService.query().subscribe((res: HttpResponse<IAudioFile[]>) => {
      this.audioFiles = res.body;
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
    this.registerChangeInAudioFiles();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IAudioFile) {
    return item.id;
  }

  registerChangeInAudioFiles() {
    this.eventSubscriber = this.eventManager.subscribe('audioFileListModification', () => this.loadAll());
  }

  delete(audioFile: IAudioFile) {
    const modalRef = this.modalService.open(AudioFileDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.audioFile = audioFile;
  }
}
