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

  // files: IAudioObject[] = [];
  state: StreamState;
  currentFile: IAudioFile;
  currentTime: number;
  playClicked = false;

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
        .subscribe((res: HttpResponse<IAudioFile[]>) => {
          this.audioFiles = res.body;
          this.initFileAndService();
        });
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
      this.initFileAndService();
    });
  }

  loadUserFiles() {
    this.likedAudioDisplayed = false;
    this.audioFileService.getUserFiles(this.user.id).subscribe((res: HttpResponse<IAudioFile[]>) => {
      this.audioFiles = res.body;
      this.currentSearch = '';
      this.initFileAndService();
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
    this.audioService.stop();
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

  getFileAndPassToService(id: number) {
    this.audioFileService.getFile(id).subscribe(
      res => {
        const blobUrl = URL.createObjectURL(res);
        this.audioService.playStream(blobUrl).subscribe(() => {
          // listening for fun here
        });
        if (!this.playClicked) {
          this.audioService.pause();
        }
      },
      (res: HttpResponse<IAudioFile>) => {
        console.error('File resource error: ' + res);
      }
    );
  }

  initFileAndService() {
    this.getFileAndPassToService(this.audioFiles[0].id);
    this.currentFile = this.audioFiles[0];
    this.audioService.getState().subscribe(state => {
      this.state = state;
    });
  }

  openFile(audioFileId: number) {
    this.audioService.stop();
    this.getFileAndPassToService(audioFileId);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.playClicked = true;
    this.audioService.play();
  }

  playThisAudio(audio: IAudioFile) {
    this.playClicked = true;
    const audioFileId = audio.id;
    this.currentFile = audio;
    this.openFile(audioFileId);
  }

  stop() {
    this.audioService.stop();
  }

  next() {
    const audioFileId = this.findAufioFileId('n');
    this.currentFile = this.audioFiles.find(x => x.id === audioFileId);
    this.openFile(audioFileId);
  }

  previous() {
    const audioFileId = this.findAufioFileId('p');
    this.currentFile = this.audioFiles.find(x => x.id === audioFileId);
    this.openFile(audioFileId);
  }

  isFirstPlaying() {
    return this.currentFile.id === this.audioFiles[0];
  }

  isLastPlaying() {
    return this.currentFile.id === this.audioFiles[this.audioFiles.length - 1];
  }

  onSliderChangeEnd(change) {
    console.error('Change: ' + change.value);
    this.audioService.seekTo(change.value);
  }

  findAufioFileId(which: string): any {
    let previous: IAudioFile = this.audioFiles[0];
    let next: IAudioFile = this.audioFiles[0];
    if (which === 'p') {
      // previous file on list
      for (const af of this.audioFiles) {
        if (af.id === this.currentFile.id) {
          break;
        }
        previous = af;
      }
      console.error('previous file id: ' + previous.id);
      return previous.id;
    } else {
      // for(let i = this.audioFiles.length; i>=0 ; i--) { // iteruje wstecz w celu znalezienia następnego elementu
      //   if(this.audioFiles[i].id === this.currentFile){
      //     break;
      //   }
      //   previous = af;
      // }
      for (let i = 0; i < this.audioFiles.length; i++) {
        if (this.audioFiles[i].id === this.currentFile.id) {
          next = this.audioFiles[i + 1];
          break;
        }
      }
      console.error('next file id: ' + next.id);
      return next.id;
    }
  }
}
