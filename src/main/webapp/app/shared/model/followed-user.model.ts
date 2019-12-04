import { Moment } from 'moment';
import { IUser } from 'app/core/user/user.model';

export interface IFollowedUser {
  id?: number;
  followedUserId?: number;
  dateFollowed?: Moment;
  user?: IUser;
}

export class FollowedUser implements IFollowedUser {
  constructor(public id?: number, public followedUserId?: number, public dateFollowed?: Moment, public user?: IUser) {}
}
