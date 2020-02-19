import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';
import { SessionStorageService } from 'ngx-webstorage';

import { VERSION } from 'app/app.constants';
import { JhiLanguageHelper } from 'app/core/language/language.helper';
import { AccountService } from 'app/core/auth/account.service';
import { LoginModalService } from 'app/core/login/login-modal.service';
import { LoginService } from 'app/core/login/login.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from 'app/core/user/user.service';
import { Account } from 'app/core/user/account.model';

@Component({
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['navbar.scss']
})
export class NavbarComponent implements OnInit {
  inProduction: boolean;
  isNavbarCollapsed: boolean;
  languages: any[];
  swaggerEnabled: boolean;
  modalRef: NgbModalRef;
  version: string;

  account: Account;
  hasImage = true;
  avatar: any;
  isImageLoading: boolean;

  userLogged: false; // trzeba wywołać pobranie aktualnego account i avatara po akcji login() z login.service

  constructor(
    private loginService: LoginService,
    private languageService: JhiLanguageService,
    private languageHelper: JhiLanguageHelper,
    private sessionStorage: SessionStorageService,
    private accountService: AccountService,
    private loginModalService: LoginModalService,
    private profileService: ProfileService,
    private router: Router,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {
    this.version = VERSION ? (VERSION.toLowerCase().startsWith('v') ? VERSION : 'v' + VERSION) : '';
    this.isNavbarCollapsed = true;
  }

  ngOnInit() {
    if (!this.avatar) {
      this.hasImage = false;
    }
    this.languages = this.languageHelper.getAll();
    // this.userLogged = false;

    // this.loginService.userLogged.subscribe(ifLogged => {
    //   this.userLogged = ifLogged;
    // });

    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      if (this.account) {
        this.getAvatarFromService();
        // console.error("get avatar");
        // console.error(this.userLogged);
      }
    });

    this.loginService.isLoggedIn.subscribe(res => {
      this.userLogged = res;
      // console.error(this.userLogged);
      // console.error('has image ' + this.hasImage);
      this.accountService.identity().subscribe((account: Account) => {
        this.account = account;
        if (this.account) {
          this.getAvatarFromService();
          // console.error('avatar' + this.avatar.toString());
          // console.error(this.account.login);
        }
      });
    });

    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.swaggerEnabled = profileInfo.swaggerEnabled;
    });
  }

  changeLanguage(languageKey: string) {
    this.sessionStorage.store('locale', languageKey);
    this.languageService.changeLanguage(languageKey);
  }

  collapseNavbar() {
    this.isNavbarCollapsed = true;
  }

  isAuthenticated() {
    return this.accountService.isAuthenticated();
  }

  login() {
    this.hasImage = true; // tymczasowo, bo nie musi mieć avatara
    this.modalRef = this.loginModalService.open();
  }

  logout() {
    this.collapseNavbar();
    this.hasImage = false;
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  getImageUrl() {
    return this.isAuthenticated() ? this.accountService.getImageUrl() : null;
    // console.error(this.accountService.getImageUrl());
    // return this.isAuthenticated() ? this.sanitizer.bypassSecurityTrustUrl(this.accountService.getImageUrl()) : null;
  }

  getAvatarFromService() {
    this.isImageLoading = true;
    this.userService.getAvatarFilename(this.account.login).subscribe(avatarFileName => {
      // console.error("avatar filename: " + avatarFileName.body);
      if (avatarFileName.body.length > 1) {
        // console.error('wykonało się');
        this.userService.getAvatar(avatarFileName.body).subscribe(
          data => {
            this.createAvatarFromBlob(data);
            this.isImageLoading = false;
            this.hasImage = true;
          },
          error => {
            this.isImageLoading = false;
            console.error(error);
          }
        );
      }
    });
  }

  createAvatarFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.avatar = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
