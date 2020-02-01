import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { PostDeleteDialogComponent } from 'app/entities/post/post-delete-dialog.component';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account;
  authSubscription: Subscription;
  modalRef: NgbModalRef;

  posts: IPost[];
  eventSubscriber: Subscription;
  itemsPerPage: number;
  links: any;
  page: any;
  predicate: any;
  reverse: any;
  totalItems: number;
  currentSearch: string;
  hasFollowedUsers = true;

  constructor(
    private accountService: AccountService,
    private loginModalService: LoginModalService,
    private eventManager: JhiEventManager,
    protected postService: PostService,
    protected modalService: NgbModal,
    protected parseLinks: JhiParseLinks,
    protected followedUserService: FollowedUserService,
    protected activatedRoute: ActivatedRoute
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
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.followedUserService.findFollowed().subscribe(res => {
        console.error('followed users length: ' + res.body.length);
        if (res.body.length > 0) {
          this.loadFollowed();
        } else {
          this.hasFollowedUsers = false;
        }
      });
    });
    this.registerAuthenticationSuccess();

    // this.loadAll();
    // this.loadFollowed();
    this.registerChangeInPosts();
  }

  registerAuthenticationSuccess() {
    this.authSubscription = this.eventManager.subscribe('authenticationSuccess', () => {
      this.accountService.identity().subscribe(account => {
        this.account = account;
        this.loadFollowed();
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

  loadAll() {
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
    this.postService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort()
      })
      .subscribe((res: HttpResponse<IPost[]>) => this.paginatePosts(res.body, res.headers));
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
      this.postService.getFollowed().subscribe((res: HttpResponse<IPost[]>) => (this.posts = res.body));
    }
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

  registerChangeInPosts() {
    this.eventSubscriber = this.eventManager.subscribe('postListModification', () => this.reset());
  }

  delete(post: IPost) {
    const modalRef = this.modalService.open(PostDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.post = post;
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
      this.posts.push(data[i]);
    }
  }
}
