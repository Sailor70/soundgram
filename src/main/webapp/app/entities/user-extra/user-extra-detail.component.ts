import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IUserExtra } from 'app/shared/model/user-extra.model';

@Component({
  selector: 'jhi-user-extra-detail',
  templateUrl: './user-extra-detail.component.html'
})
export class UserExtraDetailComponent implements OnInit {
  userExtra: IUserExtra;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ userExtra }) => {
      this.userExtra = userExtra;
    });
  }

  previousState() {
    window.history.back();
  }
}
