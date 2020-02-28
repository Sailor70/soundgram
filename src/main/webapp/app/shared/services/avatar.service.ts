import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { IUser } from 'app/core/user/user.model';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  avatars: any[] = [];
  constructor(private userService: UserService) {}

  getAvatarsForUserList(users: IUser[]): any {
    for (const user of users) {
      this.userService.getAvatarFilename(user.login).subscribe(avatarFileName => {
        console.error('avatar filename: ' + avatarFileName);
        this.userService.getAvatar(avatarFileName.body).subscribe(
          data => {
            this.createAvatarFromBlob(data);
          },
          error => {
            console.error(error);
          }
        );
      });
    }
    return this.avatars;
  }

  private createAvatarFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.avatars.push(reader.result);
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
