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

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account;
  authSubscription: Subscription;
  modalRef: NgbModalRef;

  posts: IPost[] = [];
  // eventSubscriber: Subscription;
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
    this.identityAndGetFollowed();
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
      this.postService.getFollowed().subscribe(res => {
        this.posts = res.body;
        this.postWindowService.getPostObjects(this.posts);
        // for (const post of this.posts) {
        //   console.error('posts tags:' + post.tags.length);
        // }
      });
    }
    // this.getAvatars();
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
    this.loadFollowed();
  }

  loadPage(page) {
    this.page = page;
    this.loadFollowed();
  }

  clear() {
    this.posts = [];
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
  }

  loadFollowedUsersPosts() {
    this.posts = [];
    this.followedUsersPosts = true;
    this.loadFollowed();
  }

  loadFollowedTagsPosts() {
    this.posts = [];
    this.followedUsersPosts = false;
    this.tagService.findUserTags(this.account.login).subscribe(res => {
      this.userTags = res.body;
      // console.error('User tags:' + this.userTags.length);
      this.loadPostsByTags();
    });
  }

  getAvatars() {
    for (const post of this.posts) {
      console.error('post user: ' + post.user.login);
      this.userService.getAvatarFilename(post.user.login).subscribe(avatarFileName => {
        console.error('avatar filename: ' + avatarFileName);
        this.userService.getAvatar(avatarFileName.body).subscribe(
          data => {
            this.createAvatarFromBlob(data);
          },
          error => {
            console.error(error);
          }
        );
      });
    }
  }

  // createImageFromBlob(image: Blob) {
  //   const reader = new FileReader();
  //   reader.addEventListener(
  //     'load',
  //     () => {
  //       this.postImage = reader.result;
  //       console.error('image type: ' + typeof this.postImage);
  //     },
  //     false
  //   );
  //
  //   if (image) {
  //     reader.readAsDataURL(image);
  //   }
  // }

  createAvatarFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        console.error(reader.result);
        console.error(typeof reader.result);
        this.avatars.push(reader.result);
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
