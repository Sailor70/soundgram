import { IComment } from 'app/shared/model/comment.model';

export interface ICommentAvatar {
  comment?: IComment;
  avatar?: any;
  editable?: boolean;
}

export class CommentAvatar implements ICommentAvatar {
  constructor(public comment?: IComment, public avatar?: any, public editable?: boolean) {}
}
