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
import { FollowedUser, IFollowedUser } from 'app/shared/model/followed-user.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { AvatarService } from 'app/shared/services/avatar.service';

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

  usersAvatars: { user: IUser; avatar: any }[] = [];

  constructor(
    private userService: UserService,
    private alertService: JhiAlertService,
    private accountService: AccountService,
    private parseLinks: JhiParseLinks,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventManager: JhiEventManager,
    private modalService: NgbModal,
    private followedUserService: FollowedUserService,
    private userExtraService: UserExtraService,
    private avatarService: AvatarService
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
    this.usersAvatars = null;
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
      this.loadAll();
      this.registerChangeInUsers();
    });
  }

  loadAll() {
    this.allUsersDisplayed = true;
    this.users = [];

    if (this.currentSearch) {
      const promises = [];
      const userP = new Promise(resolveOut => {
        promises.push(
          new Promise(resolve => {
            this.userService
              .search({
                query: this.currentSearch
              })
              .subscribe((res: HttpResponse<IUser[]>) => {
                this.users = res.body;
                resolve();
                resolveOut();
              });
          })
        );
      });

      userP.then(() => {
        this.userExtraService.search({ query: this.currentSearch }).subscribe(res => {
          const userExtras = res.body;
          console.error('userExtras length: ' + userExtras.length);
          for (const ue of userExtras) {
            promises.push(
              new Promise(resolve => {
                this.userService.find(ue.user.login).subscribe((user: IUser) => {
                  if (!this.contains(this.users, user)) {
                    // nie dodaje drugi raz tego samego usera jeśli wyszukało 2 razy
                    this.users.push(user);
                  }
                  resolve();
                });
              })
            );
          }
          Promise.all(promises).then(() => {
            console.error('wszystkie promisy spełnione! a było ich: ' + promises.length);
            this.usersAvatars = this.avatarService.getAvatarsForUserList(this.users);
          });
        });
      });
    } else {
      this.userService
        .query()
        .subscribe(
          (res: HttpResponse<IUser[]>) => this.onSuccess(res.body, res.headers),
          (res: HttpResponse<any>) => this.onError(res.body)
        );
    }
  }

  contains(a: IUser[], obj: IUser) {
    let i = a.length;
    while (i--) {
      if (a[i].id === obj.id) {
        return true;
      }
    }
    return false;
  }

  loadFollowed() {
    this.followedUserService
      .findFollowed()
      .subscribe(
        (res: HttpResponse<IFollowedUser[]>) => this.onLoadFollowedSuccess(res.body),
        (res: HttpResponse<any>) => this.onError(res.body)
      );
  }

  onLoadFollowedSuccess(data) {
    this.allUsersDisplayed = false;
    this.followedUsers = data;
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
    this.usersAvatars = this.avatarService.getAvatarsForUserList(this.users);
  }

  followUser(id: number) {
    this.followedUserService.createWithId(id).subscribe(
      () => {
        // eventManager wyświetla alerty na zielono lub czerwono
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
      this.loadFollowed();
      // this.activeModal.dismiss(true);
    });
    // location.reload();
  }

  registerChangeInUsers() {
    this.userListSubscription = this.eventManager.subscribe('userListModification', () => this.loadAll());
  }

  private onSuccess(data, headers) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = headers.get('X-Total-Count');
    this.users = data;
    this.usersAvatars = this.avatarService.getAvatarsForUserList(this.users);
  }

  private onError(error) {
    this.alertService.error(error.error, error.message, null);
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
