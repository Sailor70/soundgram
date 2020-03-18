import { Component, OnInit, OnDestroy } from '@angular/core'; // OnDestroy
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { IUser } from 'app/core/user/user.model';
import { StreamState } from 'app/music/player/stream-state.model';
import { AudioService } from 'app/music/player/audio-service';

@Component({
  selector: 'jhi-music',
  templateUrl: './music.component.html',
  styleUrls: ['music.component.scss'],
  providers: [AudioService]
})
export class MusicComponent implements OnInit, OnDestroy {
  audioFiles: IAudioFile[];
  // eventSubscriber: Subscription;
  currentSearch: string;
  likedAudioDisplayed = true;
  user: IUser;
  account: Account;

  state: StreamState;
  currentFile: IAudioFile;

  otherUserLogin: any;
  otherUserFiles = false;
  whoseFiles = 'My audio files';
  otherUser: IUser;
  // userSubscribtion: Subscription;

  constructor(
    protected audioFileService: AudioFileService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected userService: UserService,
    private audioService: AudioService
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(
      // this.userSubscribtion =
      ({ userLogin }) => {
        this.otherUserLogin = userLogin; // .body ? userId.body : userId;
        if (this.otherUserLogin) {
          this.otherUserFiles = true;
          this.whoseFiles = 'Files of user ' + this.otherUserLogin;
          this.getOtherUser();
          console.error('otherUserLogin: ' + this.otherUserLogin);
        } else {
          this.loadLikedFiles();
          // this.registerChangeInAudioFiles();
        }
      },
      error => {
        console.error('route error: ' + error);
      }
    );
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.userService.find(this.account.login).subscribe(res => {
        this.user = res;
      });
    });
  }

  private getOtherUser() {
    this.userService.find(this.otherUserLogin).subscribe(res => {
      this.otherUser = res;
      if (this.otherUserLogin) {
        this.loadUserFiles();
      }
    });
  }

  /*  private loadCurrentUser() {
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.userService.find(this.account.login).subscribe(res => {
        this.user = res;
      });
    });
    this.loadLikedFiles();
    this.registerChangeInAudioFiles();
  }*/

  loadAll() {
    this.likedAudioDisplayed = true;
    if (this.currentSearch) {
      this.audioFileService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IAudioFile[]>) => {
          this.audioFiles = res.body;
          if (this.state) {
            this.state.playClicked = false; // zatrzymanie auto odtwarzania po zmianie listy odtwarzania
          }
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
    if (this.state) {
      this.state.playClicked = false; // zatrzymanie auto odtwarzania po zmianie listy odtwarzania
    }
    if (this.otherUser) {
      this.otherUser = null;
      this.otherUserLogin = null;
      this.whoseFiles = 'My audio files';
    }
    this.likedAudioDisplayed = true;
    this.audioFileService.getLiked().subscribe((res: HttpResponse<IAudioFile[]>) => {
      this.audioFiles = res.body;
      this.currentSearch = '';
      this.initFileAndService();
    });
  }

  loadUserFiles() {
    if (this.state) {
      this.state.playClicked = false; // zatrzymanie auto odtwarzania po zmianie listy odtwarzania
    }
    this.likedAudioDisplayed = false;
    this.audioFileService
      .getUserFiles(this.otherUserLogin ? this.otherUser.id : this.user.id)
      .subscribe((res: HttpResponse<IAudioFile[]>) => {
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
    console.error('destroyed!');
    // this.eventManager.destroy(this.eventSubscriber);
    // this.userSubscribtion.unsubscribe();
    this.audioService.stop();
  }

  trackId(index: number, item: IAudioFile) {
    return item.id;
  }

  // registerChangeInAudioFiles() {
  //   this.eventSubscriber = this.eventManager.subscribe('audioFileListModification', () => this.loadAll());
  // }

  /* ------------------------------------------------Player------------------------------------------------------- */

  getFileAndPassToService(id: number) {
    this.audioFileService.getFile(id).subscribe(
      res => {
        const blobUrl = URL.createObjectURL(res);
        this.audioService.playStream(blobUrl).subscribe(() => {
          // listening for fun here
        });
      },
      (res: HttpResponse<IAudioFile>) => {
        console.error('File resource error: ' + res);
      }
    );
  }

  initFileAndService() {
    this.getFileAndPassToService(this.audioFiles[0].id);
    if (this.state) {
      // if audioFiles list change ( my/liked/search audio )
      this.audioService.stop();
    }
    this.currentFile = this.audioFiles[0];
    this.audioService.getState().subscribe(state => {
      this.state = state;
      // console.error('State cr time: ' + this.state.currentTime);
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
    this.state.playClicked = true;
    this.audioService.play();
  }

  playThisAudio(audio: IAudioFile) {
    this.state.playClicked = true;
    const audioFileId = audio.id;
    this.currentFile = audio;
    this.openFile(audioFileId);
  }

  stop() {
    this.audioService.stop();
  }

  next() {
    // if(this.currentFile.id !== this.audioFiles[this.audioFiles.length - 1].id) {// jeśli ostatni plik jest odtwarzany to nie szukamy następnego -> isLastPlaying();
    const audioFileId = this.findAufioFileId('n');
    this.currentFile = this.audioFiles.find(x => x.id === audioFileId);
    this.openFile(audioFileId);
    // }
  }

  previous() {
    const audioFileId = this.findAufioFileId('p');
    this.currentFile = this.audioFiles.find(x => x.id === audioFileId);
    this.openFile(audioFileId);
  }

  isFirstPlaying() {
    return this.currentFile.id === this.audioFiles[0].id;
  }

  isLastPlaying() {
    // console.error('is last playing: ' + this.currentFile.id === this.audioFiles[this.audioFiles.length - 1]);
    return this.currentFile.id === this.audioFiles[this.audioFiles.length - 1].id;
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

  previousState() {
    window.history.back();
  }
}
