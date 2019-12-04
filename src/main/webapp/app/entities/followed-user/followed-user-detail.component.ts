import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFollowedUser } from 'app/shared/model/followed-user.model';

@Component({
  selector: 'jhi-followed-user-detail',
  templateUrl: './followed-user-detail.component.html'
})
export class FollowedUserDetailComponent implements OnInit {
  followedUser: IFollowedUser;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ followedUser }) => {
      this.followedUser = followedUser;
    });
  }

  previousState() {
    window.history.back();
  }
}
