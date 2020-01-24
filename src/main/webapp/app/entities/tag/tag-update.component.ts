import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';
import { ITag, Tag } from 'app/shared/model/tag.model';
import { TagService } from './tag.service';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { IPost } from 'app/shared/model/post.model';
import { PostService } from 'app/entities/post/post.service';

@Component({
  selector: 'jhi-tag-update',
  templateUrl: './tag-update.component.html'
})
export class TagUpdateComponent implements OnInit {
  isSaving: boolean;
  addTagToUser: boolean;

  users: IUser[];

  posts: IPost[];

  tag: ITag;

  editForm = this.fb.group({
    id: [],
    name: [null, [Validators.required]],
    users: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected tagService: TagService,
    protected userService: UserService,
    protected postService: PostService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    // this.addTagToUser = false;
    this.activatedRoute.data.subscribe(({ tag }) => {
      this.updateForm(tag);
    });
    this.userService
      .query()
      .subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body), (res: HttpErrorResponse) => this.onError(res.message));
    this.postService
      .query()
      .subscribe((res: HttpResponse<IPost[]>) => (this.posts = res.body), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(tag: ITag) {
    this.editForm.patchValue({
      id: tag.id,
      name: tag.name,
      users: tag.users
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    this.tag = this.createFromForm();
    if (this.tag.id !== undefined) {
      this.subscribeToSaveResponse(this.tagService.update(this.tag));
    } else {
      this.subscribeToSaveResponse(this.tagService.create(this.tag));
    }
  }

  private createFromForm(): ITag {
    return {
      ...new Tag(),
      id: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      users: null
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITag>>) {
    result.subscribe(res => this.onSaveSuccess(res), () => this.onSaveError());
  }

  protected onSaveSuccess(res: HttpResponse<ITag>) {
    this.tag = res.body;
    this.isSaving = false;
    console.error('onSaveSuccess');
    console.error('addTagToUser ' + this.addTagToUser);
    console.error('this tag ' + this.tag.id);
    if (this.addTagToUser) {
      this.tagService.addUserToTag(this.tag).subscribe(); // res => this.tag = res.body
    }
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  checkValue(event: any) {
    this.addTagToUser = event.currentTarget.checked;
  }

  trackUserById(index: number, item: IUser) {
    return item.id;
  }

  trackPostById(index: number, item: IPost) {
    return item.id;
  }

  getSelected(selectedVals: any[], option: any) {
    if (selectedVals) {
      for (let i = 0; i < selectedVals.length; i++) {
        if (option.id === selectedVals[i].id) {
          return selectedVals[i];
        }
      }
    }
    return option;
  }
}
