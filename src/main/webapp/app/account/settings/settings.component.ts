import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { JhiLanguageService } from 'ng-jhipster';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { JhiLanguageHelper } from 'app/core/language/language.helper';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { UserService } from 'app/core/user/user.service';
import { IUser } from 'app/core/user/user.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'jhi-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  error: string;
  success: string;
  languages: any[];
  settingsForm = this.fb.group({
    firstName: [undefined, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    lastName: [undefined, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    email: [undefined, [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]],
    activated: [false],
    authorities: [[]],
    langKey: ['en'],
    login: [],
    imageUrl: [],
    imageFile: [
      '',
      [
        RxwebValidators.extension({ extensions: ['jpeg', 'png'] }),
        RxwebValidators.image({ maxHeight: 100, maxWidth: 100 }),
        RxwebValidators.fileSize({ maxSize: 2 })
      ]
    ]
  });

  extraForm = this.fb.group({
    id: [],
    userLocation: [],
    bio: [],
    user: []
  });

  user: IUser;
  userExtra: IUserExtra;

  selectedFiles: FileList;
  currentFile: File;
  currentAccount: Account;

  avatar: any;
  hasImage: boolean;
  isImageLoading: boolean;
  chooseAvatar = 'Choose Avatar';

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private languageService: JhiLanguageService,
    private languageHelper: JhiLanguageHelper,
    protected userExtraService: UserExtraService,
    protected userService: UserService
  ) {}

  ngOnInit() {
    this.hasImage = false;
    this.accountService.identity().subscribe(account => {
      this.updateForm(account);
      this.currentAccount = account;
      this.getAvatarFromService();
      this.loadExtras();
    });

    this.languages = this.languageHelper.getAll();
    // console.error("current selected file: " + this.currentFile);
  }

  loadExtras() {
    this.userService.find(this.currentAccount.login).subscribe(res => {
      this.user = res;
      this.userExtraService.find(this.user.id).subscribe(extra => {
        this.userExtra = extra.body;
        this.updateExtraForm();
      });
    });
  }

  save() {
    if (this.selectedFiles !== undefined) {
      this.currentFile = this.selectedFiles.item(0);
      this.userService.saveImage(this.currentFile, this.currentAccount.login).subscribe(
        res => {
          this.settingsForm.patchValue({
            imageUrl: res.body
          });
          console.error('avatarFilename: ' + res.body);
          this.saveAccountSettings();
          this.saveExtraSettings();
        },
        error => {
          console.error('error' + error);
          console.error('avatarFilename: ' + error.body);
        }
      );
      // this.selectedFiles = null;
    } else {
      this.saveAccountSettings();
      this.saveExtraSettings();
    }
  }

  saveAccountSettings() {
    const settingsAccount = this.accountFromForm();
    this.accountService.save(settingsAccount).subscribe(
      () => {
        this.error = null;
        this.success = 'OK';
        this.accountService.identity(true).subscribe(account => {
          this.updateForm(account);
          this.currentAccount = account;
          this.getAvatarFromService();
        });
        this.languageService.getCurrent().then(current => {
          if (settingsAccount.langKey !== current) {
            this.languageService.changeLanguage(settingsAccount.langKey);
          }
        });
      },
      () => {
        this.success = null;
        this.error = 'ERROR';
      }
    );
  }

  saveExtraSettings() {
    this.userExtra = this.extraFromForm();
    this.userExtraService.update(this.userExtra).subscribe(extra => {
      this.userExtra = extra.body;
    });
  }

  private accountFromForm(): any {
    const account = {};
    return {
      ...account,
      firstName: this.settingsForm.get('firstName').value,
      lastName: this.settingsForm.get('lastName').value,
      email: this.settingsForm.get('email').value,
      activated: this.settingsForm.get('activated').value,
      authorities: this.settingsForm.get('authorities').value,
      langKey: this.settingsForm.get('langKey').value,
      login: this.settingsForm.get('login').value,
      imageUrl: this.settingsForm.get('imageUrl').value
    };
  }

  updateForm(account: Account): void {
    this.settingsForm.patchValue({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      activated: account.activated,
      authorities: account.authorities,
      langKey: account.langKey,
      login: account.login,
      imageUrl: account.imageUrl
    });
  }

  updateExtraForm(): void {
    this.extraForm.patchValue({
      id: this.userExtra.id,
      userLocation: this.userExtra.userLocation,
      bio: this.userExtra.bio,
      user: this.userExtra.user
    });
  }

  private extraFromForm(): any {
    const extra = {};
    return {
      ...extra,
      id: this.extraForm.get('id').value,
      userLocation: this.extraForm.get('userLocation').value,
      bio: this.extraForm.get('bio').value,
      user: this.extraForm.get('user').value
    };
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    this.chooseAvatar = this.selectedFiles.item(0).name;
  }

  previousState() {
    window.history.back();
  }

  getAvatarFromService() {
    this.isImageLoading = true;
    this.userService.getAvatarFilename(this.currentAccount.login).subscribe(avatarFileName => {
      console.error('avatar filename: ' + avatarFileName.body);
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
