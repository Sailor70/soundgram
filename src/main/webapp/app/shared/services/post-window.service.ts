import { Injectable } from '@angular/core';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { PostService } from 'app/entities/post/post.service';
import { IPost } from 'app/shared/model/post.model';
import { UserService } from 'app/core/user/user.service';
import { IPostObject } from 'app/shared/post-object.model';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { IImage } from 'app/shared/model/image.model';
import { ImageService } from 'app/entities/image/image.service';
import { IComment } from 'app/shared/model/comment.model';
import { AvatarService } from 'app/shared/services/avatar.service';
import { CommentService } from 'app/entities/comment/comment.service';
// import { IComment } from 'app/shared/model/comment.model';
// import { IPostObject } from 'app/shared/post-object.model';

@Injectable({ providedIn: 'root' })
export class PostWindowService {
  post: IPost;
  postObject: IPostObject; // { post: IPost, userAvatar: any, audioFile: IAudioFile, audioSrc: any };
  audioFile: IAudioFile = null;
  audioSrc: any = null;
  avatarSrc: any;
  image: IImage;
  imageSrc: any;
  commentsAvatars: { comment: IComment; avatar: any }[] = [];
  usersComments: IComment[];

  constructor(
    private audioFileService: AudioFileService,
    private postService: PostService,
    private userService: UserService,
    private imageService: ImageService,
    private avatarService: AvatarService,
    private commentService: CommentService
  ) {}

  getPostObject(post: IPost): Observable<any> {
    this.post = post;
    // this.postObject = {post: null, userAvatar: null, audioSrc: null, audioFile: null};
    // this.getAudioFile().then(r => );
    // this.getUserAvatar();
    return forkJoin({
      post: of(post),
      userAvatar: this.getUserAvatar(),
      audioFile: this.getAudioFile(),
      audioSrc: new Promise(resolve =>
        setTimeout(() => {
          resolve(this.audioSrc);
        }, 1000)
      ), // waiting for variable to initialize ( lub ustawić fork join dopiero po probraniu audioSrc)
      imageSrc: this.getImageSrc(),
      commentsAvatars: this.getPostComments()
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

  getPostComments() {
    return new Promise((resolve, reject) => {
      this.commentService.findByPost(this.post.id).subscribe(usersComments => {
        this.usersComments = usersComments.body;
        // this.usersComments.forEach(value => console.error(value));
        this.commentsAvatars = [];
        for (const comment of usersComments.body) {
          this.userService.getAvatarFilename(comment.user.login).subscribe(avatarFileName => {
            if (avatarFileName !== '') {
              this.userService.getAvatar(avatarFileName.body).subscribe(
                image => {
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
    });
  }

  /*  getPostComments() {
      return new Promise((resolve, reject) => {
        this.commentService.findByPost(this.post.id).subscribe(
          (res: HttpResponse<IComment[]>) => {
            this.usersComments = res.body;
            // this.usersComments.forEach(value => console.error(value));
            this.commentsAvatars = [];
            this.avatarService.getAvatarsForCommentListPromise(res.body).then( (commentsAvatars) => {
              console.error('comments avatars length: ' + commentsAvatars);
              resolve(commentsAvatars);
            });
          },
          res => {
            console.error('Comments load error: ' + res.body);
            reject(res);
          }
        );
      });
    }*/

  getImageSrc() {
    return new Promise((resolve, reject) => {
      this.imageService.findByPost(this.post.id).subscribe(
        (res: HttpResponse<IImage>) => {
          this.image = res.body;
          this.imageService.getFile(res.body.id).subscribe(
            image => {
              const reader = new FileReader();
              reader.addEventListener(
                'load',
                () => {
                  this.imageSrc = reader.result;
                  resolve(reader.result);
                },
                false
              );
              if (image) {
                reader.readAsDataURL(image);
              }
            },
            error => {
              console.error(error);
              reject(error);
            }
          );
        },
        res => {
          console.error('Image load error: ' + res.body);
          reject(res);
        }
      );
    });
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
          this.getAudioFileSource().then(audioSrc => {
            this.audioSrc = audioSrc;
            // console.error('this.audioSrc: ' + this.audioSrc);
            resolve(audioFile.body);
          });
        },
        res => {
          console.error('Audio load error: ' + res.body);
          reject(res);
        }
      );
    });
  }

  getAudioFileSource() {
    // this.getAudioFile().then( () => {
    return new Promise((resolve, reject) => {
      this.audioFileService.getFile(this.audioFile.id).subscribe(
        res => {
          // const blobUrl = URL.createObjectURL(res);
          // console.error('audioSrc: ' + URL.createObjectURL(res));
          this.audioSrc = URL.createObjectURL(res);
          resolve(URL.createObjectURL(res));
        },
        res => {
          console.error('File resource error: ' + res);
          reject(res);
        }
      );
    });
    // });
  }
}
