import { IUser } from 'app/core/user/user.model';

export interface ITag {
  id?: number;
  name?: string;
  users?: IUser[];
}

export class Tag implements ITag {
  constructor(public id?: number, public name?: string, public users?: IUser[]) {}
}
