import { Moment } from 'moment';
import { IUser } from 'app/core/user/user.model';
import { IPost } from 'app/shared/model/post.model';

export interface IComment {
  id?: number;
  textContent?: string;
  date?: Moment;
  user?: IUser;
  post?: IPost;
}

export class Comment implements IComment {
  constructor(public id?: number, public textContent?: string, public date?: Moment, public user?: IUser, public post?: IPost) {}
}
