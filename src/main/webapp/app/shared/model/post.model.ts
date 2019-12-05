import { Moment } from 'moment';
import { ITag } from 'app/shared/model/tag.model';

export interface IPost {
  id?: number;
  postContent?: string;
  date?: Moment;
  tags?: ITag[];
}

export class Post implements IPost {
  constructor(public id?: number, public postContent?: string, public date?: Moment, public tags?: ITag[]) {}
}
