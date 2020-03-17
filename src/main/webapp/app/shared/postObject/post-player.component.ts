import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { HttpResponse } from '@angular/common/http';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { AudioService } from 'app/music/player/audio-service';
import { StreamState } from 'app/music/player/stream-state.model';

@Component({
  selector: 'jhi-post-player',
  templateUrl: './post-player.component.html',
  styleUrls: ['./post-player.component.scss']
})
export class PostPlayerComponent implements OnInit, OnDestroy {
  @Input() audioFile: IAudioFile | IAudioFile;
  state: StreamState;

  constructor(private audioFileService: AudioFileService, private audioService: AudioService) {}

  ngOnInit() {
    this.getFileAndPassToService(this.audioFile.id);
    this.audioService.getState().subscribe(state => {
      this.state = state;
      // console.error('State cr time: ' + this.state.currentTime);
    });
  }

  ngOnDestroy(): void {
    this.audioService.stop();
  }

  getFileAndPassToService(id: number) {
    this.audioFileService.getFile(id).subscribe(
      res => {
        const blobUrl = URL.createObjectURL(res);
        this.audioService.playStream(blobUrl).subscribe();
      },
      (res: HttpResponse<IAudioFile>) => {
        console.error('File resource error: ' + res);
      }
    );
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    // this.state.playClicked = true;
    this.audioService.play();
  }

  onSliderChangeEnd(change) {
    console.error('Change: ' + change.value);
    this.audioService.seekTo(change.value);
  }
}
