import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPost } from 'app/shared/model/post.model';
import { ImageService } from 'app/entities/image/image.service';
import { IImage } from 'app/shared/model/image.model';
import { HttpResponse } from '@angular/common/http';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';

@Component({
  selector: 'jhi-post-detail',
  templateUrl: './post-detail.component.html'
})
export class PostDetailComponent implements OnInit {
  post: IPost;
  image: IImage;
  imageUrl: any;
  img: any;

  audioFile: IAudioFile;
  fileUrl: any;
  audio: any;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected imageService: ImageService,
    protected audioFileService: AudioFileService
  ) {
    this.audio = new Audio();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ post }) => {
      this.post = post;
    });

    this.audioFileService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IAudioFile>) => {
        this.audioFile = res.body;
        this.onLoadAudioFileSuccess();
        console.error('Audio info: {}' + this.audioFile.id);
      },
      res => {
        console.error('Audio load error: ' + res.body);
      }
    );

    this.imageService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IImage>) => {
        this.image = res.body;
        this.onLoadImageSuccess();
        console.error('image info: {}' + this.image.id);
      },
      res => {
        console.error('Image load error: ' + res.body);
      }
    );
  }

  protected onLoadImageSuccess() {
    this.imageService.getFile(this.image.id).subscribe(
      res => {
        const blobUrl = URL.createObjectURL(res);
        this.imageUrl = blobUrl;
        console.error('imageUrl: ' + this.imageUrl);
        this.img = document.querySelector('img');
        this.img.addEventListener('load', () => URL.revokeObjectURL(this.imageUrl));
        document.querySelector('img').src = this.imageUrl;
        console.error('img file: ' + this.img);
      },
      res => {
        console.error('Image resource error: ' + res);
      }
    );
  }

  protected onLoadAudioFileSuccess() {
    this.audioFileService.getFile(this.audioFile.id).subscribe(
      res => {
        const blobUrl = URL.createObjectURL(res);
        this.fileUrl = blobUrl;
        this.audio.src = this.fileUrl;
      },
      (res: HttpResponse<IAudioFile>) => {
        console.error('File resource error: ' + res);
      }
    );
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

  previousState() {
    window.history.back();
  }
}
