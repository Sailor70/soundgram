import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiAlertService } from 'ng-jhipster';
import { IFollowedUser, FollowedUser } from 'app/shared/model/followed-user.model';
import { FollowedUserService } from './followed-user.service';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'jhi-followed-user-update',
  templateUrl: './followed-user-update.component.html'
})
export class FollowedUserUpdateComponent implements OnInit {
  isSaving: boolean;

  users: IUser[];

  editForm = this.fb.group({
    id: [],
    followedUserId: [null, [Validators.required]],
    dateFollowed: [],
    user: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected followedUserService: FollowedUserService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ followedUser }) => {
      this.updateForm(followedUser);
    });
    this.userService
      .query()
      .subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(followedUser: IFollowedUser) {
    this.editForm.patchValue({
      id: followedUser.id,
      followedUserId: followedUser.followedUserId,
      dateFollowed: followedUser.dateFollowed != null ? followedUser.dateFollowed.format(DATE_TIME_FORMAT) : null,
      user: followedUser.user
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const followedUser = this.createFromForm();
    if (followedUser.id !== undefined) {
      this.subscribeToSaveResponse(this.followedUserService.update(followedUser));
    } else {
      this.subscribeToSaveResponse(this.followedUserService.create(followedUser));
    }
  }

  private createFromForm(): IFollowedUser {
    return {
      ...new FollowedUser(),
      id: this.editForm.get(['id']).value,
      followedUserId: this.editForm.get(['followedUserId']).value,
      dateFollowed:
        this.editForm.get(['dateFollowed']).value != null ? moment(this.editForm.get(['dateFollowed']).value, DATE_TIME_FORMAT) : undefined,
      user: this.editForm.get(['user']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFollowedUser>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackUserById(index: number, item: IUser) {
    return item.id;
  }
}
