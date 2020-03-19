import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';

@Component({
  selector: 'jhi-audio-file-detail',
  templateUrl: './audio-file-detail.component.html',
  styleUrls: ['audio-file.scss']
})
export class AudioFileDetailComponent implements OnInit {
  audioFile: IAudioFile;

  constructor(protected activatedRoute: ActivatedRoute, protected audioFileService: AudioFileService) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ audioFile }) => {
      this.audioFile = audioFile;
    });
  }

  onLikeClicked(updatedAudioFile: IAudioFile): void {
    this.audioFile = updatedAudioFile;
  }

  previousState() {
    window.history.back();
  }
}
