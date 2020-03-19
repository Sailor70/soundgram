import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IPost } from 'app/shared/model/post.model';
import { ImageService } from 'app/entities/image/image.service';
import { IImage } from 'app/shared/model/image.model';
import { HttpResponse } from '@angular/common/http';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { PostCommentsComponent } from 'app/shared/postObject/post-comments.component';
import { IComment } from 'app/shared/model/comment.model';
import { CommentService } from 'app/entities/comment/comment.service';

@Component({
  selector: 'jhi-post-object',
  templateUrl: './post-object.component.html',
  styleUrls: ['./post-object.component.scss']
})
export class PostObjectComponent implements OnInit {
  @Input() post: IPost | IPost; // to disable IPost export warning

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
    protected imageService: ImageService,
    protected audioFileService: AudioFileService,
    protected commentService: CommentService,
    protected userService: UserService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.hasImage = false;
    this.getAvatarFromService();

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
}
