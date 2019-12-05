import { IPost } from 'app/shared/model/post.model';
import { IUser } from 'app/core/user/user.model';

export interface IAudioFile {
  id?: number;
  audioPath?: string;
  title?: string;
  iconPath?: string;
  post?: IPost;
  users?: IUser[];
}

export class AudioFile implements IAudioFile {
  constructor(
    public id?: number,
    public audioPath?: string,
    public title?: string,
    public iconPath?: string,
    public post?: IPost,
    public users?: IUser[]
  ) {}
}
