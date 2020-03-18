import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AudioFile, IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'jhi-audio-file-detail',
  templateUrl: './audio-file-detail.component.html',
  styleUrls: ['audio-file.scss']
})
export class AudioFileDetailComponent implements OnInit {
  audioFile: IAudioFile;

  liked = false;
  likeBtnText = 'Like this audio';

  constructor(protected activatedRoute: ActivatedRoute, protected audioFileService: AudioFileService) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ audioFile }) => {
      this.audioFile = audioFile;
      this.checkIfLiked();
    });
  }

  likeOrDislikeAudioFile() {
    if (!this.liked) {
      this.audioFileService.addUser(this.audioFile).subscribe((res: HttpResponse<AudioFile>) => {
        this.audioFile = res.body;
        this.liked = true;
        this.likeBtnText = 'Dislike this audio';
      });
    } else {
      this.audioFileService.removeUser(this.audioFile).subscribe((res: HttpResponse<AudioFile>) => {
        this.audioFile = res.body;
        this.liked = false;
        this.likeBtnText = 'Like this audio';
      });
    }
  }

  private checkIfLiked() {
    this.audioFileService.getLiked().subscribe(liked => {
      const likedAudios: IAudioFile[] = liked.body;
      for (const la of likedAudios) {
        if (la.id === this.audioFile.id) {
          this.liked = true;
          this.likeBtnText = 'Dislike this audio';
        }
      }
    });
  }

  previousState() {
    window.history.back();
  }
}
