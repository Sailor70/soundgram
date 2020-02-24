import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { UserService } from 'app/core/user/user.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'jhi-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['post.scss']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: IPost;
  image: IImage;
  imageUrl: any;
  img: any;

  audioFile: IAudioFile;
  fileUrl: any;
  audio: any;
  audioBypass: any;

  commentContent: string;
  newComment: IComment;
  usersComments: IComment[];
  currentUser: IUser;

  avatar: any;
  postImage: any;
  isImageLoading: boolean;
  account: Account;
  hasImage: boolean;

  show = false;
  liked = false;
  likeBtnText = 'Like this audio';

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected imageService: ImageService,
    protected audioFileService: AudioFileService,
    protected commentService: CommentService,
    protected userService: UserService,
    private sanitizer: DomSanitizer
  ) {
    this.audio = new Audio();
  }

  ngOnInit() {
    this.hasImage = false;
    this.activatedRoute.data.subscribe(({ post }) => {
      this.post = post;
      this.getAvatarFromService();
    });

    this.audioFileService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IAudioFile>) => {
        this.audioFile = res.body;
        this.onLoadAudioFileSuccess();
        this.checkIfLiked();
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
        // this.onLoadImageSuccess();
        this.getPostImageFromService();
        console.error('image id:' + this.image.id);
      },
      res => {
        console.error('Image load error: ' + res.body);
      }
    );

    this.commentService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IComment[]>) => {
        this.usersComments = res.body;
        // this.usersComments.forEach(value => console.error(value));
      },
      res => {
        console.error('Comments load error: ' + res.body);
      }
    );

    // this.principal.identity().then(account => {
    //   this.currentUser = account;
    // });
  }

  ngOnDestroy(): void {
    this.audio.pause();
  }

  protected onLoadAudioFileSuccess() {
    this.audioFileService.getFile(this.audioFile.id).subscribe(
      res => {
        const blobUrl = URL.createObjectURL(res);
        this.fileUrl = blobUrl;
        this.audio.src = this.fileUrl;
        this.audioBypass = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
      },
      (res: HttpResponse<IAudioFile>) => {
        console.error('File resource error: ' + res);
      }
    );
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

  // likeAudioFile() {
  //   // this.audioFile.users.push()
  //   this.audioFileService.addUser(this.audioFile).subscribe((res: HttpResponse<AudioFile>) => {
  //     this.audioFile = res.body;
  //     this.liked = true;
  //   });
  // }

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

  toggleComment() {
    this.show = !this.show;
  }

  getAvatarFromService() {
    this.isImageLoading = true;
    console.error('post user: ' + this.post.user.login);
    this.userService.getAvatarFilename(this.post.user.login).subscribe(avatarFileName => {
      console.error('avatar filename: ' + avatarFileName);
      this.userService.getAvatar(avatarFileName.body).subscribe(
        data => {
          this.createAvatarFromBlob(data);
          this.isImageLoading = false;
          this.hasImage = true;
        },
        error => {
          this.isImageLoading = false;
          console.error(error);
        }
      );
    });
  }

  getPostImageFromService() {
    this.isImageLoading = true;
    console.error('post user: ' + this.image.id);
    this.imageService.getFile(this.image.id).subscribe(
      data => {
        this.createImageFromBlob(data);
        this.isImageLoading = false;
      },
      error => {
        this.isImageLoading = false;
        console.error(error);
      }
    );
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.postImage = reader.result;
        console.error('image type: ' + typeof this.postImage);
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  createAvatarFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.avatar = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  previousState() {
    window.history.back();
  }
}
