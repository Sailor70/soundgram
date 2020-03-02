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
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { CommentDeleteDialogComponent } from 'app/entities/comment/comment-delete-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AudioService } from 'app/music/player/audio-service';
import { StreamState } from 'app/music/player/stream-state.model';
import { AvatarService } from 'app/shared/services/avatar.service';

@Component({
  selector: 'jhi-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['post.scss'],
  providers: [AudioService]
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: IPost;
  image: IImage;
  postImage: any;

  audioFile: IAudioFile;
  state: StreamState;

  commentContent: string;
  newComment: IComment;
  usersComments: IComment[];
  currentUser: IUser;

  avatar: any;
  isImageLoading: boolean;
  account: Account;
  hasImage: boolean;

  showCommentWindow = false;
  liked = false;
  likeBtnText = 'Like this audio';
  commentsAvatars: { comment: IComment; avatar: any }[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected imageService: ImageService,
    protected audioFileService: AudioFileService,
    protected commentService: CommentService,
    protected userService: UserService,
    private sanitizer: DomSanitizer,
    private accountService: AccountService,
    private modalService: NgbModal,
    private audioService: AudioService,
    private avatarService: AvatarService
  ) {}

  ngOnInit() {
    this.commentsAvatars = null;
    this.hasImage = false;
    this.activatedRoute.data.subscribe(({ post }) => {
      this.post = post;
      this.getAvatarFromService();
    });

    this.audioFileService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IAudioFile>) => {
        this.audioFile = res.body;
        this.initAudioFileAndService();
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
        this.getCommentsAvatars();
      },
      res => {
        console.error('Comments load error: ' + res.body);
      }
    );

    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.userService.find(this.account.login).subscribe(res => {
        this.currentUser = res;
        console.error('current user: ' + this.currentUser.login);
      });
    });
  }

  getCommentsAvatars() {
    this.commentsAvatars = [];
    // const usersOfComments: IUser[] = [];
    // for (const userComment of this.usersComments) {
    //   usersOfComments.push(userComment.user);
    // }
    this.commentsAvatars = this.avatarService.getAvatarsForCommentList(this.usersComments);
    for (const commentAvatar of this.commentsAvatars) {
      console.error('comment user ' + commentAvatar.comment.user + ' avatar ' + commentAvatar.avatar);
    }
  }

  ngOnDestroy(): void {
    this.audioService.stop();
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
    this.commentService.create(this.newComment).subscribe(() => {
      // this.currentUser = res.body;
      this.showCommentWindow = false;
      this.commentContent = '';
      this.ngOnInit();
    });
  }

  toggleComment() {
    this.showCommentWindow = !this.showCommentWindow;
  }

  deleteComment(comment: IComment) {
    const modalRef = this.modalService.open(CommentDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.comment = comment;
    modalRef.componentInstance.isDeleted.subscribe(() => {
      this.ngOnInit();
    });
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

  /* ----------------------------------------------player--------------------------------------------- */

  initAudioFileAndService() {
    this.getFileAndPassToService(this.audioFile.id);
    this.audioService.getState().subscribe(state => {
      this.state = state;
      // console.error('State cr time: ' + this.state.currentTime);
    });
  }

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
