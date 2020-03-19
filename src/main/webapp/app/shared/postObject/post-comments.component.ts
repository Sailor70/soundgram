import { Component, Input, OnInit } from '@angular/core';
import { IPost } from 'app/shared/model/post.model';
import { Comment, IComment } from 'app/shared/model/comment.model';
import { IUser } from 'app/core/user/user.model';
import { AvatarService } from 'app/shared/services/avatar.service';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommentService } from 'app/entities/comment/comment.service';
import * as moment from 'moment';
import { now } from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { CommentDeleteDialogComponent } from 'app/entities/comment/comment-delete-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICommentAvatar } from 'app/shared/model/comment-avatar.model';
import { JhiParseLinks } from 'ng-jhipster';
import { COMMENTS_PER_PAGE } from 'app/shared/constants/pagination.constants';

@Component({
  selector: 'jhi-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
  providers: [AvatarService] // jedna instancja servisu na zadeklarowany provider ( post-comment me swoją instance tego serwisu )
})
export class PostCommentsComponent implements OnInit {
  @Input() post: IPost | IPost;
  @Input() currentUser: IUser | IUser;

  commentContent: string;
  newComment: IComment;
  usersComments: IComment[];
  showCommentWindow = false;
  commentsAvatars: ICommentAvatar[] = []; // { comment: IComment; avatar: any; editable: boolean }[] = [];

  itemsPerPage: number;
  links: any;
  page: any;
  totalItems: number;

  constructor(
    protected commentService: CommentService,
    private avatarService: AvatarService,
    private modalService: NgbModal,
    protected parseLinks: JhiParseLinks
  ) {
    this.commentsAvatars = [];
    this.itemsPerPage = COMMENTS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0
    };
  }

  ngOnInit() {
    this.commentsAvatars = [];
    this.commentContent = '';
    this.usersComments = [];
    this.page = 0;
    this.links = {
      last: 0
    };

    this.loadComments();
  }

  loadComments() {
    this.commentService
      .findByPost(this.post.id, {
        page: this.page,
        size: this.itemsPerPage,
        sort: ['date' + ',' + 'desc'] // sortuje commenty od najnowszego według daty
      })
      .subscribe(
        (res: HttpResponse<IComment[]>) => {
          // this.usersComments = res.body;
          // console.error('user comments: ' + this.usersComments.length);
          // this.usersComments.forEach(value => console.error(value));
          this.paginateComments(res.body, res.headers);
          // this.getCommentsAvatars();
        },
        res => {
          console.error('Comments load error: ' + res.body);
        }
      );
  }

  loadPage(page) {
    if (!(this.page >= this.links['last'])) {
      this.page = page;
      this.loadComments();
    }
  }

  /*  protected paginateComments(data: IPost[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    const commentsTmp: IComment[] = [];
    for (let i = 0; i < data.length; i++) {
      console.error('comment to paginate id: ' + data[i].id);
      this.usersComments.push(data[i]);
      commentsTmp.push(data[i]);
    }
    console.error('commentsTmp length: ' + commentsTmp.length);
    this.getCommentsAvatars(commentsTmp);
  }

  resetPaging() {
    this.commentsAvatars = [];
    this.page = 0;
    this.links = {
      last: 0
    };
  }

  getCommentsAvatars(commentsToPush: IComment[]) {
    // this.commentsAvatars = [];
    const commentAvatarsTmp: ICommentAvatar[] = this.avatarService.getAvatarsForCommentListEd(commentsToPush);
    console.error('commentsAvatarsTmp length: ' + commentAvatarsTmp.length);
    // console.error('get comments avatars length ' + this.commentsAvatars.length);
    for (const commentAvatar of commentAvatarsTmp) {
      this.commentsAvatars.push(commentAvatar);
      console.error('comment user ' + commentAvatar.comment.user.login + ' avatar ' + commentAvatar.avatar);
    }
  }*/

  protected paginateComments(data: IPost[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    for (let i = 0; i < data.length; i++) {
      console.error('comment to paginate id: ' + data[i].id);
      this.usersComments.push(data[i]);
    }
    this.getCommentsAvatars();
  }

  resetPaging() {
    this.commentsAvatars = [];
    this.page = 0;
    this.links = {
      last: 0
    };
  }

  // pobieramy za każdym razem wszystkie commentsAvatars a lepiej by było pushować nowo pobrane z paginacji
  getCommentsAvatars() {
    this.commentsAvatars = [];
    this.avatarService.getAvatarsForCommentListEd(this.usersComments).then((sortedCA: ICommentAvatar[]) => {
      this.commentsAvatars = sortedCA;
    });
    console.error('get comments avatars length ' + this.commentsAvatars.length);
    for (const commentAvatar of this.commentsAvatars) {
      console.error(
        'comment date ' +
          commentAvatar.comment.date
            .toDate()
            .getTime()
            .toString()
      );
    }
  }

  addComment() {
    this.newComment = new (class implements IComment {
      date: moment.Moment;
      id: number;
      post: IPost;
      textContent: string;
      user: IUser;
    })();
    this.newComment.post = this.post;
    this.newComment.textContent = this.commentContent;
    this.newComment.user = null; // spróbować pobrać usera na frontendzie bo teraz idzie ze spring security
    this.newComment.date = moment(new Date(now()), DATE_TIME_FORMAT);
    this.commentService.create(this.newComment).subscribe(() => {
      // this.currentUser = res.body;
      this.showCommentWindow = false;
      this.commentContent = '';
      this.ngOnInit();
    });
  }

  toggleComment() {
    this.showCommentWindow = !this.showCommentWindow;
  }

  deleteComment(comment: IComment) {
    const modalRef = this.modalService.open(CommentDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.comment = comment;
    modalRef.componentInstance.isDeleted.subscribe(() => {
      this.ngOnInit();
    });
  }

  onEdit(comment: IComment) {
    this.commentContent = comment.textContent;
  }

  saveComment(comment: IComment) {
    this.resetPaging();
    const commentEdited = {
      ...new Comment(),
      id: comment.id,
      textContent: this.commentContent,
      date: comment.date,
      user: comment.user,
      post: comment.post
    };
    this.commentService.update(commentEdited).subscribe(() => {
      this.ngOnInit();
    });
  }
}
