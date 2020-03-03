import { IPost } from 'app/shared/model/post.model';
import { IImage } from 'app/shared/model/image.model';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { StreamState } from 'app/music/player/stream-state.model';
import { IComment } from 'app/shared/model/comment.model';
import { Account } from 'app/core/user/account.model';

export interface IPostObject {
  post: IPost;
  userAvatar: any;
  audioFile: IAudioFile;
  audioSrc: any;
  /* post: IPost;
  userAvatar: any;

  image: IImage;
  postImage: any;
  // imageUrl: any;
  // img: any;

  audioFile: IAudioFile;
  state: StreamState;

  commentContent: string;
  newComment: IComment;
  usersComments: IComment[];
  commentsAvatars: any[];

  isImageLoading: boolean;
  account: Account;
  hasImage: boolean;

  showCommentWindow: boolean;
  liked: boolean;*/
}

// export class PostObject implements IPostObject {
//   constructor(public url?: string, public title?: string, public user?: string) {}
// }
