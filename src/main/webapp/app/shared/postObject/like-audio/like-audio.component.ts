import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AudioFile, IAudioFile } from 'app/shared/model/audio-file.model';
import { HttpResponse } from '@angular/common/http';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';

@Component({
  selector: 'jhi-like-audio',
  templateUrl: './like-audio.component.html',
  styleUrls: ['./like-audio.component.scss']
})
export class LikeAudioComponent implements OnInit {
  @Input() audioFile: IAudioFile | IAudioFile;

  @Output() likeClicked: EventEmitter<IAudioFile> = new EventEmitter<IAudioFile>();

  liked = false;
  likeBtnText = 'Like this audio';

  constructor(protected audioFileService: AudioFileService) {}

  ngOnInit() {
    this.checkIfLiked();
  }

  likeOrDislikeAudioFile() {
    if (!this.liked) {
      this.audioFileService.addUser(this.audioFile).subscribe((res: HttpResponse<AudioFile>) => {
        this.audioFile = res.body;
        this.likeClicked.emit(this.audioFile); // po zmianie listy userów którzy polubili audio trzeba wysłać zaktualizowany audioFile do parent component
        this.liked = true;
        this.likeBtnText = 'Dislike this audio';
      });
    } else {
      this.audioFileService.removeUser(this.audioFile).subscribe((res: HttpResponse<AudioFile>) => {
        this.audioFile = res.body;
        this.likeClicked.emit(this.audioFile);
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
}
