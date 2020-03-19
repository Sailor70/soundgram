import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPost } from 'app/shared/model/post.model';
import { ImageService } from 'app/entities/image/image.service';
import { IImage } from 'app/shared/model/image.model';
import { HttpResponse } from '@angular/common/http';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { CommentService } from 'app/entities/comment/comment.service';
import { IComment } from 'app/shared/model/comment.model';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AudioService } from 'app/music/player/audio-service';
import { PostDeleteDialogComponent } from 'app/entities/post/post-delete-dialog.component';
import { PostCommentsComponent } from 'app/shared/postObject/post-comments.component';

@Component({
  selector: 'jhi-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['post.scss'],
  providers: [AudioService]
})
export class PostDetailComponent implements OnInit {
  post: IPost;
  postImage: any;
  image: IImage;
  audioFile: IAudioFile;
  usersComments: IComment[];

  currentUser: IUser;
  account: Account;

  avatar: any;
  isImageLoading: boolean;
  hasImage: boolean;

  @ViewChild(PostCommentsComponent, { static: false })
  private postCommentsComponent: PostCommentsComponent;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected imageService: ImageService,
    protected audioFileService: AudioFileService,
    protected commentService: CommentService,
    protected userService: UserService,
    private accountService: AccountService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.hasImage = false;
    this.activatedRoute.data.subscribe(({ post }) => {
      this.post = post;
      this.getAvatarFromService();
    });

    this.audioFileService.findByPost(this.post.id).subscribe(
      (res: HttpResponse<IAudioFile>) => {
        this.audioFile = res.body;
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

  onLikeClicked(updatedAudioFile: IAudioFile): void {
    this.audioFile = updatedAudioFile;
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

  deletePost(post: IPost) {
    const modalRef = this.modalService.open(PostDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.post = post;
    modalRef.componentInstance.isDeleted.subscribe(() => {
      this.previousState();
    });
  }

  previousState() {
    window.history.back();
  }
}
