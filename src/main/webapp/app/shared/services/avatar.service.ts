import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { IComment } from 'app/shared/model/comment.model';
import { IUser } from 'app/core/user/user.model';
import { ICommentAvatar } from 'app/shared/model/comment-avatar.model';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  commentsAvatars: { comment: IComment; avatar: any }[] = [];
  commentsAvatarsEd: ICommentAvatar[] = [];
  usersAvatars: { user: IUser; avatar: any }[] = [];
  comments: IComment[] = [];
  users: IUser[] = [];

  constructor(private userService: UserService) {}

  getAvatarsForUserList(users: IUser[]): any {
    // console.error('users at avatar length: ' + users.length);
    this.usersAvatars = [];
    this.users = users;
    for (const user of users) {
      this.userService.getAvatarFilename(user.login).subscribe(avatarFileName => {
        // console.error('avatar user login:' + user.login);
        // console.error('avatar filename: ' + avatarFileName.body);
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

  getAvatarsForCommentListEd(comments: IComment[]) {
    return new Promise(resolve => {
      // console.error('comments ED: ' + comments.length);
      const promises = [];
      this.commentsAvatarsEd = [];
      this.comments = [];
      this.comments = comments;
      for (const comment of comments) {
        promises.push(
          new Promise(resolveInside => {
            this.userService.getAvatarFilename(comment.user.login).subscribe(avatarFileName => {
              console.error('avatar user login: ' + comment.user.login);
              console.error('avatar filename: ' + avatarFileName.body);
              if (avatarFileName.body !== '') {
                this.userService.getAvatar(avatarFileName.body).subscribe(
                  data => {
                    this.createAvatarFromBlobEd(data, comment).then(() => {
                      resolveInside();
                    });
                  },
                  error => {
                    console.error('Probably no avatar: ' + error);
                    this.commentsAvatarsEd.push({ comment, avatar: null, editable: false });
                    resolveInside();
                  }
                );
              } else {
                this.commentsAvatarsEd.push({ comment, avatar: null, editable: false });
                resolveInside();
              }
            });
          })
        );
      }
      // console.error('this.commentsAvatarsEd: ' + this.commentsAvatarsEd.length);
      // promises.push(this.sortByDate());
      Promise.all(promises).then(() => {
        console.error('wszystkie promisy spełnione! a było ich: ' + promises.length);
        this.sortByDate().then(() => {
          resolve(this.commentsAvatarsEd);
        });
      });
    });
    // return this.commentsAvatarsEd;
  }

  sortByDate() {
    return new Promise(resolve => {
      console.error('items to sort: ' + this.commentsAvatarsEd.length);
      this.commentsAvatarsEd.sort((a: ICommentAvatar, b: ICommentAvatar) => {
        return b.comment.date.toDate().getTime() - a.comment.date.toDate().getTime(); // sorts them descending (latest dates first)
      });
      resolve();
    });
  }

  private createAvatarFromBlobEd(image: Blob, comment: IComment) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => {
          this.commentsAvatarsEd.push({ comment, avatar: reader.result, editable: false });
          resolve();
        },
        false
      );

      if (image) {
        reader.readAsDataURL(image);
      }
    });
  }
}
