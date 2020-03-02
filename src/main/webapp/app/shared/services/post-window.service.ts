import { Injectable } from '@angular/core';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { PostService } from 'app/entities/post/post.service';
import { IPost } from 'app/shared/model/post.model';
import { UserService } from 'app/core/user/user.service';
import { IComment } from 'app/shared/model/comment.model';
import { IPostObject } from 'app/shared/post-object.model';

@Injectable({ providedIn: 'root' })
export class PostWindowService {
  posts: IPost[] = [];
  postObject: { post: IPost; userAvatar: any }[] = [];

  private postArray = new Array<IPostObject>(100);

  constructor(private audioFileService: AudioFileService, private postService: PostService, private userService: UserService) {}

  getPostObjects(posts: IPost[]): any {
    this.posts = posts;
    // this.initPostObject();
    for (let i = 0; i < posts.length; i++) {
      this.postArray[i].post = posts[i];
      // this.getUserAvatar(posts[i], i);
    }
    this.printResults();
  }

  printResults() {
    for (let i = 0; i < this.posts.length; i++) {
      console.error('post: ' + this.postArray[i].post.user);
      // console.error('post: ' + this.postObject[i].post.user + 'user avatar: ' + this.postObject[i].userAvatar);
    }
  }

  initPostObject() {
    for (let i = 0; i < this.posts.length; i++) {
      this.postObject[i].post = this.posts[i];
    }
  }

  getUserAvatar(post: IPost, i: number) {
    this.userService.getAvatarFilename(post.user.login).subscribe(avatarFileName => {
      console.error('avatar user login:' + post.user.login);
      console.error('avatar filename: ' + avatarFileName.body);
      this.userService.getAvatar(avatarFileName.body).subscribe(
        data => {
          this.createAvatarFromBlob(data, i);
        },
        error => {
          console.error(error);
        }
      );
    });
  }

  private createAvatarFromBlob(image: Blob, i: number) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        // this.postArray[i].userAvatar = reader.result;
        this.postObject[i].userAvatar = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
