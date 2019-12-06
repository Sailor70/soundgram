import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ActivatedRoute, Router } from '@angular/router';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.model';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';

@Component({
  selector: 'jhi-users',
  templateUrl: './users.component.html',
  styleUrls: ['users.component.scss']
})
export class UsersComponent implements OnInit {
  currentAccount: any;
  users: User[];
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
    this.routeData = this.activatedRoute.data.subscribe(data => {
      //this.page = data.pagingParams.page;
      //this.previousPage = data.pagingParams.page;
      //this.reverse = data.pagingParams.ascending;
      //this.predicate = data.pagingParams.predicate;
    });
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

  loadPage(page: number) {
    // if (page !== this.previousPage) {
    //   this.previousPage = page;
    //   this.transition();
    // }
  }

  loadAll() {
    this.userService
      .query({
        // page: this.page - 1,
        size: this.itemsPerPage
        // sort: this.sort()
      })
      .subscribe((res: HttpResponse<User[]>) => this.onSuccess(res.body, res.headers), (res: HttpResponse<any>) => this.onError(res.body));
  }

  followUser(id: number) {
    this.followedUserService.createWithId(id).subscribe(
      res => {
        // eventManager wyświetla alerty na zielono lub czerwono
        this.eventManager.broadcast({
          name: 'followedUserListModification',
          content: 'Follow user with id '
        });
        //this.activeModal.dismiss(true);
      },
      // jeśli zwraca null to powinien wyświetlić alert że nie można obserwować tego usera
      res => this.onError(res.body)
    );
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
}
