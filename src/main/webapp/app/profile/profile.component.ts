import { Component, OnInit } from '@angular/core';
import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
// import { Account } from "app/core/user/user.service";

@Component({
  selector: 'jhi-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {
  message: string;
  user: User;
  currentAccount: Account;
  private principal: any;

  constructor(private userService: UserService) // private pricipal: Principal
  {
    this.message = 'ProfileComponent message';
  }

  ngOnInit() {
    this.principal.identity().then(account => {
      this.currentAccount = account;
      // account.login;
      this.userService.find(this.currentAccount.name).subscribe(res => (this.user = res));
    });

    // this.userService.
  }
}
