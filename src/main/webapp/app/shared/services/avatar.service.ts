import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { IComment } from 'app/shared/model/comment.model';
import { IUser } from 'app/core/user/user.model';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  commentsAvatars: { comment: IComment; avatar: any }[] = [];
  usersAvatars: { user: IUser; avatar: any }[] = [];
  comments: IComment[] = [];
  users: IUser[] = [];

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
        if (avatarFileName !== '') {
          this.userService.getAvatar(avatarFileName.body).subscribe(
            data => {
              this.createAvatarFromBlob(data, comment);
            },
            error => {
              console.error('Probably no avatar: ' + error);
            }
          );
        } else {
          this.commentsAvatars.push({ comment, avatar: null });
        }
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

  getAvatarsForUserList(users: IUser[]): any {
    this.usersAvatars = [];
    this.users = users;
    for (const user of users) {
      this.userService.getAvatarFilename(user.login).subscribe(avatarFileName => {
        console.error('avatar user login:' + user.login);
        console.error('avatar filename: ' + avatarFileName.body);
        if (avatarFileName.body !== '') {
          this.userService.getAvatar(avatarFileName.body).subscribe(
            data => {
              this.createAvatarFromBlobForUser(data, user);
            },
            error => {
              console.error('Probably no avatar: ' + error);
            }
          );
        } else {
          console.error('push empty avatar');
          this.usersAvatars.push({ user, avatar: null });
        }
      });
    }
    // console.error('this.avatars: ' + +this.avatars[0].toString());
    return this.usersAvatars;
  }

  private createAvatarFromBlobForUser(image: Blob, user: IUser) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.usersAvatars.push({ user, avatar: reader.result });
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
