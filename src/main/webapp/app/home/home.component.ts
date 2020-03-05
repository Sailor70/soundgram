import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiParseLinks } from 'ng-jhipster';

import { LoginModalService } from 'app/core/login/login-modal.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { IPost } from 'app/shared/model/post.model';
import { PostService } from 'app/entities/post/post.service';
import { ActivatedRoute } from '@angular/router';
import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';
import { TagService } from 'app/entities/tag/tag.service';
import { ITag } from 'app/shared/model/tag.model';
import { LoginService } from 'app/core/login/login.service';
import { Moment } from 'moment';
import { PostDetailComponent } from 'app/entities/post/post-detail.component';
import { UserService } from 'app/core/user/user.service';
import { PostWindowService } from 'app/shared/services/post-window.service';
import { IPostObject } from 'app/shared/post-object.model';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.scss'],
  providers: [PostWindowService] // jedna instancja servisu na zadeklarowany provider ( home me swoją instance tego serwisu )
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account;
  authSubscription: Subscription;
  modalRef: NgbModalRef;

  posts: IPost[] = [];

  eventSubscriber: Subscription;
  itemsPerPage: number;
  links: any;
  page: any;
  predicate: any;
  reverse: any;
  totalItems: number;
  currentSearch: string;

  hasFollowedUsers = true;
  userLogged = false;
  followedUsersPosts = true;
  userTags: ITag[];
  avatars: any[];
  postObjects: IPostObject[] = [];

  @ViewChild(PostDetailComponent, { static: false })
  private detailComponent: PostDetailComponent;

  constructor(
    private accountService: AccountService,
    private loginModalService: LoginModalService,
    private eventManager: JhiEventManager,
    private loginService: LoginService,
    protected postService: PostService,
    protected modalService: NgbModal,
    protected parseLinks: JhiParseLinks,
    protected followedUserService: FollowedUserService,
    protected tagService: TagService,
    protected activatedRoute: ActivatedRoute,
    private userService: UserService,
    private postWindowService: PostWindowService
  ) {
    this.posts = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0
    };
    this.predicate = 'id';
    this.reverse = true;
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  ngOnInit() {
    // this.postObjects = null;
    this.identityAndGetFollowed();
    this.registerChangeInPosts();
    this.registerAuthenticationSuccess();
    this.loginService.isLoggedIn.subscribe(isLogged => {
      this.userLogged = isLogged;
      this.identityAndGetFollowed();
    });
  }

  identityAndGetFollowed() {
    this.accountService.identity().subscribe((account: Account) => {
      if (account) {
        this.account = account;
        if (this.account.activated) {
          this.followedUserService.findFollowed().subscribe(res => {
            // console.error('followed users length: ' + res.body.length);
            if (res.body.length > 0) {
              this.hasFollowedUsers = true;
              this.loadFollowed();
              // console.error('get followed ');
            } else {
              this.hasFollowedUsers = false;
              console.error('has followed users: false');
            }
          });
        } else {
          console.error('Please activate your account!');
        }
      }
    });
  }

  registerChangeInPosts() {
    this.eventSubscriber = this.eventManager.subscribe('postListModification', () => this.reset());
  }

  registerAuthenticationSuccess() {
    this.authSubscription = this.eventManager.subscribe('authenticationSuccess', () => {
      this.accountService.identity().subscribe(account => {
        this.account = account;
      });
    });
  }

  isAuthenticated() {
    return this.accountService.isAuthenticated();
  }

  login() {
    this.modalRef = this.loginModalService.open();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.eventManager.destroy(this.authSubscription);
    }
    this.eventManager.destroy(this.eventSubscriber);
  }

  loadFollowed() {
    if (this.currentSearch) {
      this.postService
        .search({
          query: this.currentSearch,
          page: this.page,
          size: this.itemsPerPage,
          sort: this.sort()
        })
        .subscribe((res: HttpResponse<IPost[]>) => this.paginatePosts(res.body, res.headers));
      return;
    }
    if (this.hasFollowedUsers) {
      this.postService
        .getFollowed({
          page: this.page,
          size: this.itemsPerPage,
          sort: this.sort()
        })
        .subscribe(res => {
          this.paginatePosts(res.body, res.headers);
          // this.posts = res.body;
          // this.getPostObjectFromService();
        });
    }
    // this.getAvatars();
  }

  getPostObjectFromService() {
    this.postObjects = [];
    for (let i = 0; i < this.posts.length; i++) {
      // console.error('post user login: ' + post.user.login);
      this.postWindowService.getPostObject(this.posts[i]).subscribe({
        next: value => {
          // console.error('comment avatar user login: ' + value.commentsAvatars[0].comment.user.login);
          console.error('post commentAvatars length: ' + value.commentsAvatars.length + ' i : ' + i);
          this.postObjects.push(value);
          console.error('post object user: ' + this.postObjects[i].post.user.login);
        }
        // complete: () => console.error('This is how it ends!')
      });
    }
    // this.checkPostObjectValues();
  }

  pushPostObject(posts: IPost[]) {
    for (let i = 0; i < posts.length; i++) {
      this.postWindowService.getPostObject(posts[i]).subscribe({
        next: value => {
          this.postObjects.push(value);
        },
        complete: () => console.error('Pushed post of user: ' + posts[i].user.login)
      });
    }
    // this.checkPostObjectValues();
  }

  checkPostObjectValues() {
    console.error('check postObject values!');
    // for(const postObject of this.postObject) {
    const postObject: IPostObject = this.postObjects[1];

    console.error(
      'Post user: ' +
        postObject.post.user +
        '\nuser avatar length: ' +
        postObject.userAvatar.length +
        '\naudioFile title ' +
        postObject.audioFile.title +
        '\naudioFIle length ' +
        postObject.audioSrc.length +
        '\nimageSrc length ' +
        postObject.imageSrc.length +
        '\n0 comment user ' +
        postObject.commentsAvatars[0].comment.user.login +
        '\navatar length ' +
        postObject.commentsAvatars[0].avatar.length
    );
    // }
  }

  loadPostsByTags() {
    this.postService.query().subscribe((res: HttpResponse<IPost[]>) => {
      this.posts = res.body;
      // console.error('all posts:' + this.posts.length);
      const tmpPosts = [];
      for (const post of this.posts) {
        // console.error("postTags:" + post.tags.length);
        if (post.tags) {
          for (const postTag of post.tags) {
            for (const tag of this.userTags) {
              if (tag.name === postTag.name) {
                tmpPosts.push(post);
                break;
              }
            }
          }
        }
      }
      this.posts = tmpPosts;
    });
  }

  reset() {
    this.page = 0;
    this.posts = [];
    this.postObjects = [];
    this.loadFollowed();
  }

  loadPage(page) {
    this.page = page;
    this.loadFollowed();
  }

  clear() {
    this.posts = [];
    this.postObjects = [];
    this.links = {
      last: 0
    };
    this.page = 0;
    this.predicate = 'id';
    this.reverse = true;
    this.currentSearch = '';
    this.loadFollowed();
  }

  search(query) {
    if (!query) {
      return this.clear();
    }
    this.posts = [];
    this.postObjects = [];
    this.links = {
      last: 0
    };
    this.page = 0;
    this.predicate = '_score';
    this.reverse = false;
    this.currentSearch = query;
    this.loadFollowed();
  }

  trackId(index: number, item: IPost) {
    return item.id;
  }

  trackDate(date: Moment, item: IPost) {
    return item.date;
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginatePosts(data: IPost[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    for (let i = 0; i < data.length; i++) {
      // console.error("post tags: " + data[i].user.login);
      this.posts.push(data[i]);
    }
    this.pushPostObject(data);
    // this.getPostObjectFromService();
  }

  loadFollowedUsersPosts() {
    this.posts = [];
    this.postObjects = [];
    this.followedUsersPosts = true;
    this.loadFollowed();
  }

  loadFollowedTagsPosts() {
    this.posts = [];
    this.postObjects = [];
    this.followedUsersPosts = false;
    this.tagService.findUserTags(this.account.login).subscribe(res => {
      this.userTags = res.body;
      // console.error('User tags:' + this.userTags.length);
      this.loadPostsByTags();
    });
  }
}
