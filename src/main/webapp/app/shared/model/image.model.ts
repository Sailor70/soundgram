import { IPost } from 'app/shared/model/post.model';

export interface IImage {
  id?: number;
  path?: string;
  name?: string;
  post?: IPost;
}

export class Image implements IImage {
  constructor(public id?: number, public path?: string, public name?: string, public post?: IPost) {}
}
