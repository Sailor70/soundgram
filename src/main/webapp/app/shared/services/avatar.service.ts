import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { IComment } from 'app/shared/model/comment.model';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  commentsAvatars: { comment: IComment; avatar: any }[] = [];
  comments: IComment[] = [];
  constructor(private userService: UserService) {}

  // getAvatarsForUserList(users: IUser[]): any {
  //   for (const user of users) {
  //     console.error('avatar user login:' + user.login);
  //     this.userService.getAvatarFilename(user.login).subscribe(avatarFileName => {
  //       console.error('avatar filename: ' + avatarFileName.body);
  //       this.userService.getAvatar(avatarFileName.body).subscribe(
  //         data => {
  //           this.createAvatarFromBlob(data);
  //         },
  //         error => {
  //           console.error(error);
  //         }
  //       );
  //     });
  //   }
  //   // console.error('this.avatars: ' + +this.avatars[0].toString());
  //   return this.avatars;
  // }

  getAvatarsForCommentList(comments: IComment[]): any {
    this.commentsAvatars = [];
    this.comments = comments;
    for (const comment of comments) {
      this.userService.getAvatarFilename(comment.user.login).subscribe(avatarFileName => {
        console.error('avatar user login:' + comment.user.login);
        console.error('avatar filename: ' + avatarFileName.body);
        this.userService.getAvatar(avatarFileName.body).subscribe(
          data => {
            this.createAvatarFromBlob(data, comment);
          },
          error => {
            console.error(error);
          }
        );
      });
    }
    // console.error('this.avatars: ' + +this.avatars[0].toString());
    return this.commentsAvatars;
  }

  private createAvatarFromBlob(image: Blob, comment: IComment) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.commentsAvatars.push({ comment, avatar: reader.result });
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
