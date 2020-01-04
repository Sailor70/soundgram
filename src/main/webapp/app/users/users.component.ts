import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ActivatedRoute, Router } from '@angular/router';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { IUser, User } from 'app/core/user/user.model';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';
import { FollowedUser } from 'app/shared/model/followed-user.model';

@Component({
  selector: 'jhi-users',
  templateUrl: './users.component.html',
  styleUrls: ['users.component.scss']
})
export class UsersComponent implements OnInit {
  currentAccount: any;
  users: IUser[];
  usersCpy: User[];
  followedUsers: FollowedUser[];
  error: any;
  success: any;
  userListSubscription: Subscription;
  routeData: Subscription;
  links: any;
  totalItems: any;
  itemsPerPage: any;
  page: any;
  predicate: any;
  previousPage: any;
  reverse: any;
  allUsersDisplayed = true;
  currentSearch: string;

  constructor(
    private userService: UserService,
    private alertService: JhiAlertService,
    private accountService: AccountService,
    private parseLinks: JhiParseLinks,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventManager: JhiEventManager,
    private modalService: NgbModal,
    private followedUserService: FollowedUserService
  ) {
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.routeData = this.activatedRoute.data
      .subscribe
      // data => {
      // this.page = data.pagingParams.page;
      // this.previousPage = data.pagingParams.page;
      // this.reverse = data.pagingParams.ascending;
      // this.predicate = data.pagingParams.predicate;
      // }
      ();
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  ngOnInit() {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
      this.loadAll();
      this.registerChangeInUsers();
    });
  }

  transition() {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.page,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    });
    this.loadAll();
  }

  // loadPage(page: number) {
  //   page;
  //   // if (page !== this.previousPage) {
  //   //   this.previousPage = page;
  //   //   this.transition();
  //   // }
  // }

  loadAll() {
    this.allUsersDisplayed = true;
    // console.error("load alles");
    if (this.currentSearch) {
      this.userService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body));
      return;
    }
    this.userService
      .query()
      .subscribe((res: HttpResponse<IUser[]>) => this.onSuccess(res.body, res.headers), (res: HttpResponse<any>) => this.onError(res.body));
  }

  loadFollowed() {
    this.followedUserService
      .findFollowed()
      .subscribe((res: HttpResponse<User[]>) => this.onLoadFollowedSuccess(res.body), (res: HttpResponse<any>) => this.onError(res.body));
  }

  onLoadFollowedSuccess(data) {
    this.allUsersDisplayed = false;
    this.followedUsers = data;
    // console.error(this.followedUsers);
    this.usersCpy = this.users;
    this.users = [];
    let i = 0;
    for (const fu of this.followedUsers) {
      for (const user of this.usersCpy) {
        if (user.id === fu.followedUserId) {
          this.users[i] = user;
          i++;
        }
      }
    }
  }

  followUser(id: number) {
    this.followedUserService.createWithId(id).subscribe(
      res => {
        // eventManager wyświetla alerty na zielono lub czerwono
        res; // tak dla sprawy nieużytego res
        this.eventManager.broadcast({
          name: 'followedUserListModification',
          content: 'Follow user with id '
        });
        // this.activeModal.dismiss(true);
      },
      // jeśli zwraca null to powinien wyświetlić alert że nie można obserwować tego usera
      res => this.onError(res.body)
    );
  }

  unfollowUser(id: number) {
    this.followedUserService.deleteFollowedId(id).subscribe(() => {
      this.eventManager.broadcast({
        name: 'followedUserListModification',
        content: 'Deleted an followedUser'
      });
      // this.activeModal.dismiss(true);
    });
    this.loadFollowed();
    // location.reload();
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  registerChangeInUsers() {
    this.userListSubscription = this.eventManager.subscribe('userListModification', () => this.loadAll());
  }

  private onSuccess(data, headers) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = headers.get('X-Total-Count');
    this.users = data;
  }

  private onError(error) {
    this.alertService.error(error.error, error.message, null);
  }

  trackIdentity(index, item: User) {
    return item.id;
  }

  search(query) {
    if (!query) {
      return this.clear();
    }
    this.currentSearch = query;
    this.loadAll();
  }

  clear() {
    this.currentSearch = '';
    this.loadAll();
  }
}
