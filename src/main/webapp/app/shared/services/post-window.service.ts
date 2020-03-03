import { Injectable } from '@angular/core';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { PostService } from 'app/entities/post/post.service';
import { IPost } from 'app/shared/model/post.model';
import { UserService } from 'app/core/user/user.service';
import { IPostObject } from 'app/shared/post-object.model';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { IAudioFile } from 'app/shared/model/audio-file.model';
// import { IComment } from 'app/shared/model/comment.model';
// import { IPostObject } from 'app/shared/post-object.model';

@Injectable({ providedIn: 'root' })
export class PostWindowService {
  post: IPost;
  postObject: IPostObject; // { post: IPost, userAvatar: any, audioFile: IAudioFile, audioSrc: any };
  dataComplete = false;
  audioFile: IAudioFile = null;
  audioSrc: any = null;
  avatarSrc: any;

  constructor(private audioFileService: AudioFileService, private postService: PostService, private userService: UserService) {}

  getPostObject(post: IPost): Observable<any> {
    this.post = post;
    this.postObject = { post: null, userAvatar: null, audioSrc: null, audioFile: null };
    // this.getAudioFile().then(r => );
    // this.getUserAvatar();
    return forkJoin({
      post: of(post),
      userAvatar: this.getUserAvatar(),
      audioSrc: this.getAudioFile(),
      audioFile: of(null, this.audioFile)
    });
  }

  getPostValues(): any {
    return forkJoin({
      avatar: this.getUserAvatar(),
      avatarSrc: this.getAudioFile()
    }).subscribe();
  }

  printResults() {
    console.error('post: ' + this.postObject.post.user + 'user avatar: ' + this.postObject.userAvatar);
  }

  getUserAvatar() {
    return new Promise((resolve, reject) => {
      this.userService.getAvatarFilename(this.post.user.login).subscribe(avatarFileName => {
        // console.error('avatar user login:' + post.user.login);
        // console.error('avatar filename: ' + avatarFileName.body);
        this.userService.getAvatar(avatarFileName.body).subscribe(
          data => {
            // this.createAvatarFromBlob(data);
            const reader = new FileReader();
            reader.addEventListener(
              'load',
              () => {
                this.avatarSrc = reader.result;
                resolve(reader.result);
              },
              false
            );

            if (data) {
              reader.readAsDataURL(data);
            }
          },
          error => {
            console.error(error);
            reject(error);
          }
        );
      });
    });
  }

  getAudioFile() {
    return new Promise((resolve, reject) => {
      this.audioFileService.findByPost(this.post.id).subscribe(
        (audioFile: HttpResponse<IAudioFile>) => {
          this.audioFile = audioFile.body;
          this.audioFileService.getFile(audioFile.body.id).subscribe(
            res => {
              // const blobUrl = URL.createObjectURL(res);
              this.audioSrc = URL.createObjectURL(res);
              resolve(URL.createObjectURL(res));
            },
            res => {
              console.error('File resource error: ' + res);
              reject(res);
            }
          );
        },
        res => {
          console.error('Audio load error: ' + res.body);
          reject(res);
        }
      );
    });
  }

  /*  getPostObjects(posts: IPost[]): any {
      this.postObject = [];
      this.posts = posts;
      // this.postObject.length = this.posts.length;
      this.initPostObject();
      for (let i = 0; i < posts.length; i++) {
        // this.postObject[i].post = this.posts[i];
        // this.postArray[i].post = posts[i];
        this.getUserAvatar(posts[i], i);
      }
      this.printResults();
    }

    printResults() {
      for (let i = 0; i < this.posts.length; i++) {
        //  console.error('post: ' + this.postArray[i].post.user);
        console.error('post: ' + this.postObject[i].post.user.login + 'user avatar: ' + this.postObject[i].userAvatar);
      }
    }

    initPostObject() {
      // this.postArray.length = this.posts.length;
      // console.error('array length: ' + this.postArray.length);
      for (let i = 0; i < this.posts.length; i++) {
        this.postObject.push( { post: this.posts[i] , userAvatar: null } );
      }
    }

    getUserAvatar(post: IPost, i: number) {
      this.userService.getAvatarFilename(post.user.login).subscribe(avatarFileName => {
        // console.error('avatar user login:' + post.user.login);
        // console.error('avatar filename: ' + avatarFileName.body);
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
          console.error('user avatar: ' + this.postObject[i].userAvatar);
        },
        false
      );

      if (image) {
        reader.readAsDataURL(image);
      }
    }*/
}
