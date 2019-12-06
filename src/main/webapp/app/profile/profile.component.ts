import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'jhi-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {
  message: string;

  constructor() {
    this.message = 'ProfileComponent message';
  }

  ngOnInit() {}
}
