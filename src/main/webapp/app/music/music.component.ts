import { Component, OnInit, OnDestroy } from '@angular/core'; // OnDestroy
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { Subscription } from 'rxjs';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AudioFileDeleteDialogComponent } from 'app/entities/audio-file/audio-file-delete-dialog.component';
import { HttpResponse } from '@angular/common/http';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { IUser } from 'app/core/user/user.model';
import { StreamState } from 'app/music/player/stream-state.model';
import { CloudService } from 'app/music/player/cloud.service';
import { AudioService } from 'app/music/player/audio-service';

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
  user: IUser;
  account: Account;

  files: Array<any> = [];
  state: StreamState;
  currentFile: any = {};

  constructor(
    protected audioFileService: AudioFileService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected userService: UserService,
    private audioService: AudioService,
    private cloudService: CloudService
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';

    this.audioService.getState().subscribe(state => {
      this.state = state;
    });
  }

  ngOnInit() {
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.userService.find(this.account.login).subscribe(res => {
        this.user = res;
      });
    });
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
      this.cloudService.getFiles(this.audioFiles).subscribe(files => {
        this.files = files;
      });
      this.currentSearch = '';
    });
  }

  loadUserFiles() {
    this.likedAudioDisplayed = false;
    this.audioFileService.getUserFiles(this.user.id).subscribe((res: HttpResponse<IAudioFile[]>) => {
      this.audioFiles = res.body;
      this.cloudService.getFiles(this.audioFiles).subscribe(files => {
        this.files = files;
      });
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

  /* ------------------------------------------------Player------------------------------------------------------- */

  playThisAudio(audio: IAudioFile) {}

  playStream(url) {
    this.audioService.playStream(url).subscribe(events => {
      // listening for fun here
    });
  }

  openFile(file, index) {
    this.currentFile = { index, file };
    this.audioService.stop();
    this.playStream(file.url);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  stop() {
    this.audioService.stop();
  }

  next() {
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    this.openFile(file, index);
  }

  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    this.openFile(file, index);
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }

  onSliderChangeEnd(change) {
    this.audioService.seekTo(change.value);
  }
}
