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

  getAvatarsForCommentListPromise(comments: IComment[]) {
    return new Promise((resolve, reject) => {
      // this.commentsAvatars = [];
      this.comments = comments;
      for (const comment of comments) {
        this.userService.getAvatarFilename(comment.user.login).subscribe(avatarFileName => {
          // console.error('avatar user login:' + comment.user.login);
          // console.error('avatar filename: ' + avatarFileName.body);
          if (avatarFileName !== '') {
            this.userService.getAvatar(avatarFileName.body).subscribe(
              data => {
                this.createAvatarFromBlob(data, comment);
              },
              error => {
                reject(error);
                console.error('Probably no avatar: ' + error);
              }
            );
          } else {
            this.commentsAvatars.push({ comment, avatar: null });
          }
        });
      }
      console.error('commentsAvatars length in avatar service: ' + this.commentsAvatars.length);
      resolve(this.commentsAvatars);
    });
  }

  getAvatarsForCommentList(comments: IComment[]): any {
    this.commentsAvatars = [];
    this.comments = comments;
    for (const comment of comments) {
      this.userService.getAvatarFilename(comment.user.login).subscribe(avatarFileName => {
        // console.error('avatar user login:' + comment.user.login);
        // console.error('avatar filename: ' + avatarFileName.body);
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
          new Promise((resolveInside, reject) => {
            this.userService.getAvatarFilename(comment.user.login).subscribe(avatarFileName => {
              // console.error('avatar user login: ' + comment.user.login);
              // console.error('avatar filename: ' + avatarFileName.body);
              if (avatarFileName !== '') {
                this.userService.getAvatar(avatarFileName.body).subscribe(
                  data => {
                    this.createAvatarFromBlobEd(data, comment);
                    resolveInside();
                  },
                  error => {
                    console.error('Probably no avatar: ' + error);
                    reject();
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
      promises.push(this.sortByDate());
      Promise.all(promises).then(() => {
        console.error('wszystkie promisy spełnione! a było ich: ' + promises.length);
        resolve(this.commentsAvatarsEd);
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
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.commentsAvatarsEd.push({ comment, avatar: reader.result, editable: false });
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
