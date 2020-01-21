import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPost } from 'app/shared/model/post.model';
import { ImageService } from 'app/entities/image/image.service';
import { IImage } from 'app/shared/model/image.model';
import { HttpResponse } from '@angular/common/http';
import { AudioFile, IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { CommentService } from 'app/entities/comment/comment.service';
import { IComment } from 'app/shared/model/comment.model';
import { IUser } from 'app/core/user/user.model';
import * as moment from 'moment';
import { now } from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';

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

  commentContent: string;
  newComment: IComment;
  usersComments: IComment[];
  currentUser: IUser;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected imageService: ImageService,
    protected audioFileService: AudioFileService,
    protected commentService: CommentService
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
        console.error('Audio id:' + this.audioFile.id);
        // this.audioFile.users.forEach((user) => user.id);
        console.error('Audio users count:' + this.audioFile.users.length);
      },
      res => {
        console.error('Audio load error: ' + res.body);
      }
    );

    this.imageService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IImage>) => {
        this.image = res.body;
        this.onLoadImageSuccess();
        console.error('image id:' + this.image.id);
      },
      res => {
        console.error('Image load error: ' + res.body);
      }
    );

    this.commentService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IComment[]>) => {
        this.usersComments = res.body;
      },
      res => {
        console.error('Comments load error: ' + res.body);
      }
    );

    // this.principal.identity().then(account => {
    //   this.currentUser = account;
    // });
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

  likeAudioFile() {
    // this.audioFile.users.push()
    this.audioFileService.addUser(this.audioFile).subscribe((res: HttpResponse<AudioFile>) => {
      this.audioFile = res.body;
    });
  }

  addComment() {
    this.newComment = new (class implements IComment {
      date: moment.Moment;
      id: number;
      post: IPost;
      textContent: string;
      user: IUser;
    })();
    this.newComment.post = this.post;
    this.newComment.textContent = this.commentContent;
    this.newComment.user = null; // spróbować pobrać usera na frontendzie bo teraz idzie ze spring security
    this.newComment.date = moment(new Date(now()), DATE_TIME_FORMAT);
    this.commentService.create(this.newComment).subscribe((res: HttpResponse<IUser>) => {
      this.currentUser = res.body;
    });
  }

  previousState() {
    window.history.back();
  }
}
