import { IUser } from 'app/core/user/user.model';

export interface IUserExtra {
  id?: number;
  userLocation?: string;
  bio?: string;
  user?: IUser;
}

export class UserExtra implements IUserExtra {
  constructor(public id?: number, public userLocation?: string, public bio?: string, public user?: IUser) {}
}
