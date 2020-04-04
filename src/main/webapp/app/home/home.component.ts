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
import { ITEMS_PER_PAGE_POST_OBJ } from 'app/shared/constants/pagination.constants';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';
import { TagService } from 'app/entities/tag/tag.service';
import { ITag } from 'app/shared/model/tag.model';
import { LoginService } from 'app/core/login/login.service';
import { PostObjectComponent } from 'app/shared/postObject/post-object.component';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.scss']
  // providers: [PostWindowService] // jedna instancja servisu na zadeklarowany provider ( home me swoją instance tego serwisu )
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account;
  authSubscription: Subscription;
  modalRef: NgbModalRef;

  posts: IPost[] = [];
  postsWithUserTags: IPost[] = [];

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

  @ViewChild(PostObjectComponent, { static: false })
  private postObjectComponent: PostObjectComponent;

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
    protected activatedRoute: ActivatedRoute
  ) {
    this.posts = [];
    this.postsWithUserTags = [];
    this.itemsPerPage = ITEMS_PER_PAGE_POST_OBJ;
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
          sort: ['date' + ',' + 'desc'] // sortuje posty od najnowszego według daty
        })
        .subscribe((res: HttpResponse<IPost[]>) => this.paginatePosts(res.body, res.headers));
      return;
    }
    if (this.hasFollowedUsers) {
      this.postService
        .getFollowed({
          page: this.page,
          size: this.itemsPerPage,
          sort: ['date' + ',' + 'desc'] // sortuje posty od najnowszego według daty
        })
        .subscribe(res => {
          this.paginatePosts(res.body, res.headers);
        });
    }
    // this.getAvatars();
  }

  loadPostsByTags() {
    this.postService.query().subscribe((res: HttpResponse<IPost[]>) => {
      const allPosts = res.body;
      // console.error('all posts:' + this.posts.length);
      for (const post of allPosts) {
        // console.error("postTags:" + post.tags.length);
        if (post.tags) {
          for (const postTag of post.tags) {
            for (const tag of this.userTags) {
              if (tag.name === postTag.name) {
                this.postsWithUserTags.push(post);
                break;
              }
            }
          }
        }
      }
      this.pushPostWithTags(this.page);
      this.links = { last: this.postsWithUserTags.length / this.itemsPerPage };
      console.error('links: ' + this.links.last);
    });
  }

  pushPostWithTags(page: number) {
    for (let i = 0; i < this.itemsPerPage; i++) {
      if (this.postsWithUserTags[page * this.itemsPerPage + i]) {
        this.posts.push(this.postsWithUserTags[page * this.itemsPerPage + i]);
      }
    }
  }

  resetOnPostsChange() {
    this.postsWithUserTags = [];
    this.posts = [];
    this.page = 0;
    this.links = {
      last: 0
    };
  }

  reset() {
    this.page = 0;
    this.posts = [];
    this.loadFollowed();
  }

  loadPage(page) {
    this.page = page;
    if (this.followedUsersPosts) {
      this.loadFollowed();
    } else {
      this.pushPostWithTags(this.page);
    }
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

  protected paginatePosts(data: IPost[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    for (let i = 0; i < data.length; i++) {
      // console.error("post tags: " + data[i].user.login);
      this.posts.push(data[i]);
    }
  }

  loadFollowedUsersPosts() {
    this.resetOnPostsChange();
    this.followedUsersPosts = true;
    this.loadFollowed();
  }

  loadFollowedTagsPosts() {
    this.resetOnPostsChange();
    this.followedUsersPosts = false;
    this.tagService.findUserTags(this.account.login).subscribe(res => {
      this.userTags = res.body;
      // console.error('User tags:' + this.userTags.length);
      this.loadPostsByTags();
    });
  }
}
