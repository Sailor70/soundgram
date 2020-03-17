import { IPost } from 'app/shared/model/post.model';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { IComment } from 'app/shared/model/comment.model';

export interface IPostObject {
  post: IPost;
  userAvatar: any;
  audioFile: IAudioFile;
  audioSrc: any;
  imageSrc: any;
  commentsAvatars: { comment: IComment; avatar: any }[];
}

// export class PostObject implements IPostObject {
//   constructor(public url?: string, public title?: string, public user?: string) {}
// }
