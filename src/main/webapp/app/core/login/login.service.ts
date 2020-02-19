import { EventEmitter, Injectable, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { AccountService } from 'app/core/auth/account.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';
// import {Subject} from "rxjs";

@Injectable({ providedIn: 'root' })
export class LoginService {
  // public userLogged = new Subject(); // Alternate method to Emitting data across Components. Subject() is doing both Emitting data and Subscribing it in another component. So its the best way to compare with Emitting using Output.

  @Output() isLoggedIn: EventEmitter<any> = new EventEmitter();

  constructor(private accountService: AccountService, private authServerProvider: AuthServerProvider) {}

  // login(credentials) {
  //   // this.userLogged.next(true);
  //   this.isLoggedIn.emit(true);
  //   return this.authServerProvider.login(credentials).pipe(flatMap(() => this.accountService.identity(true)));
  // }

  login(credentials) {
    return this.authServerProvider.login(credentials).pipe(
      map(() => {
        this.accountService.identity(true);
        this.isLoggedIn.next(true);
      })
    );
  }

  logout() {
    this.authServerProvider.logout().subscribe(null, null, () => {
      this.accountService.authenticate(null);
      // this.userLogged.next(false);
      this.isLoggedIn.emit(false);
    });
  }
}
