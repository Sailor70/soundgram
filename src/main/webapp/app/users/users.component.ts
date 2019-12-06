import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'jhi-users',
  templateUrl: './users.component.html',
  styleUrls: ['users.component.scss']
})
export class UsersComponent implements OnInit {
  message: string;

  constructor() {
    this.message = 'UsersComponent message';
  }

  ngOnInit() {}
}
