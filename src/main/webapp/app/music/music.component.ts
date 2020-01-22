import { Component, OnInit, OnDestroy } from '@angular/core'; // OnDestroy
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { Subscription } from 'rxjs';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AudioFileDeleteDialogComponent } from 'app/entities/audio-file/audio-file-delete-dialog.component';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'jhi-music',
  templateUrl: './music.component.html',
  styleUrls: ['music.component.scss']
})
export class MusicComponent implements OnInit, OnDestroy {
  audioFiles: IAudioFile[];
  eventSubscriber: Subscription;
  currentSearch: string;

  likedAudioDisplayed = true;

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

  ngOnInit() {
    this.loadLikedFiles();
    // this.loadAll();
    this.registerChangeInAudioFiles();
  }

  loadAll() {
    this.likedAudioDisplayed = true;
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

  loadLikedFiles() {
    this.likedAudioDisplayed = true;
    this.audioFileService.getLiked().subscribe((res: HttpResponse<IAudioFile[]>) => {
      this.audioFiles = res.body;
      this.currentSearch = '';
    });
  }

  loadUserFiles() {
    this.likedAudioDisplayed = false;
    this.audioFileService.getUserFiles().subscribe((res: HttpResponse<IAudioFile[]>) => {
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

  ngOnDestroy() {
    // console.error('destroyed!');
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
