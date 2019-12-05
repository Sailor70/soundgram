import { IUser } from 'app/core/user/user.model';
import { IPost } from 'app/shared/model/post.model';

export interface ITag {
  id?: number;
  name?: string;
  users?: IUser[];
  posts?: IPost[];
}

export class Tag implements ITag {
  constructor(public id?: number, public name?: string, public users?: IUser[], public posts?: IPost[]) {}
}
