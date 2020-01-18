import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'jhi-audio-file-detail',
  templateUrl: './audio-file-detail.component.html'
})
export class AudioFileDetailComponent implements OnInit {
  audioFile: IAudioFile;
  fileName: String;
  fileUrl: any;
  audio: any;

  constructor(protected activatedRoute: ActivatedRoute, protected audioFileService: AudioFileService) {
    this.audio = new Audio();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ audioFile }) => {
      this.audioFile = audioFile;
    });
    this.audioFileService.getFile(this.audioFile.id).subscribe(
      res => {
        // const blob: Blob = res; // new Blob([res.blob()], {type: "audio/mpeg"}); // mp3?
        // const file = new File([blob], 'plik.mp3', { type: 'audio/mpeg', lastModified: Date.now() });
        const blobUrl = URL.createObjectURL(res);
        this.fileUrl = blobUrl;
        this.audio.src = this.fileUrl;
        // console.error('File resource title: ' + res.headers.get('filename'));
        // console.error('File name: ' + res.headers.getAttributeNames());
      },
      (res: HttpResponse<IAudioFile>) => {
        console.error('File resource error: ' + res);
      }
    );
  }

  previousState() {
    window.history.back();
  }

  playAudio() {
    if (!this.audio.paused) {
      this.audio.load();
      this.audio.play();
    } else {
      this.audio.play();
    }
  }
  pauseAudio() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }
}
