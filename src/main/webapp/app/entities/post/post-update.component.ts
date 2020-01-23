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
import { IPost, Post } from 'app/shared/model/post.model';
import { PostService } from './post.service';
import { ITag } from 'app/shared/model/tag.model';
import { TagService } from 'app/entities/tag/tag.service';
import { now } from 'moment';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { ImageService } from 'app/entities/image/image.service';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'jhi-post-update',
  templateUrl: './post-update.component.html'
})
export class PostUpdateComponent implements OnInit {
  isSaving: boolean;

  tags: ITag[];
  // users: IUser[];
  selectedAudioFiles: FileList;
  selectedImages: FileList;
  currentAudioFile: File;
  currentImage: File;
  msg: any;

  currentPost: IPost;

  editForm = this.fb.group({
    id: [],
    postContent: [],
    date: [],
    tags: [],
    user: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected postService: PostService,
    protected tagService: TagService,
    protected audioFileService: AudioFileService,
    protected imageService: ImageService,
    protected activatedRoute: ActivatedRoute,
    protected userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ post }) => {
      this.updateForm(post);
    });
    this.tagService
      .query()
      .subscribe((res: HttpResponse<ITag[]>) => (this.tags = res.body), (res: HttpErrorResponse) => this.onError(res.message));
    /*    this.userService
      .query()
      .subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body), (res: HttpErrorResponse) => this.onError(res.message));*/
  }

  updateForm(post: IPost) {
    this.editForm.patchValue({
      id: post.id,
      postContent: post.postContent,
      date: post.date != null ? post.date.format(DATE_TIME_FORMAT) : null,
      tags: post.tags,
      user: null
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.currentAudioFile = this.selectedAudioFiles.item(0);
    this.currentImage = this.selectedImages.item(0);
    this.isSaving = true;
    const post = this.createFromForm();
    if (post.id !== undefined) {
      this.subscribeToSaveResponse(this.postService.update(post));
    } else {
      this.subscribeToSaveResponse(this.postService.create(post));
    }
  }

  private createFromForm(): IPost {
    return {
      ...new Post(),
      id: this.editForm.get(['id']).value,
      postContent: this.editForm.get(['postContent']).value,
      date: moment(new Date(now()), DATE_TIME_FORMAT), // aktualna data
      tags: this.editForm.get(['tags']).value,
      user: null
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPost>>) {
    result.subscribe(res => this.onSaveSuccess(res), res => this.onSaveError(res));
  }

  protected onSaveSuccess(res: HttpResponse<IPost>) {
    this.currentPost = res.body;

    this.audioFileService.create(this.currentAudioFile, this.currentPost.id).subscribe();
    this.imageService.create(this.currentImage, this.currentPost.id).subscribe();
    console.error('currentPost: {]', this.currentPost.id);

    this.selectedAudioFiles = null;
    this.selectedImages = null;

    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(res: HttpResponse<IPost>) {
    this.msg = res.body;
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackTagByName(index: number, item: ITag) {
    return item.name;
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

  selectAudioFile(event) {
    this.selectedAudioFiles = event.target.files;
  }

  selectImage(event) {
    this.selectedImages = event.target.files;
  }
}

// Create new empty post
/*
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
import { IPost, Post } from 'app/shared/model/post.model';
import { PostService } from './post.service';
import { ITag } from 'app/shared/model/tag.model';
import { TagService } from 'app/entities/tag/tag.service';
import { now } from 'moment';

@Component({
  selector: 'jhi-post-update',
  templateUrl: './post-update.component.html'
})
export class PostUpdateComponent implements OnInit {
  isSaving: boolean;
  newPost: boolean;

  tags: ITag[];
  currentPost: IPost;
  selectedFiles: FileList;

  editForm = this.fb.group({
    id: [],
    postContent: [],
    date: [],
    tags: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected postService: PostService,
    protected tagService: TagService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.newPost = false;
    this.activatedRoute.data.subscribe(({ post }) => {
      this.updateForm(post);
      this.currentPost = post;
    });
    this.tagService
      .query()
      .subscribe((res: HttpResponse<ITag[]>) => (this.tags = res.body), (res: HttpErrorResponse) => this.onError(res.message));
    // if not updating post, then create new empty one to pass its id to new AudioFile
    if (this.currentPost.id === undefined) {
      this.newPost = true;
      this.postService.create(this.createEmptyPost())
        .subscribe((res: HttpResponse<IPost>) => this.currentPost = res.body, (res: HttpErrorResponse) => this.onError(res.message));
    }
  }

  updateForm(post: IPost) {
    this.editForm.patchValue({
      id: post.id,
      postContent: post.postContent,
      date: post.date != null ? post.date.format(DATE_TIME_FORMAT) : null,
      tags: post.tags
    });
  }

  previousState() {
    console.error('Wycofalo');
    window.history.back();
  }

  save() {
    this.isSaving = true;
    if(this.newPost) { // to uaktualniamy nullowy post
      this.currentPost = this.updateFromForm(this.currentPost);
      this.subscribeToSaveResponse(this.postService.update(this.currentPost));
    }
    else { // aktualizuje stary post
      const post = this.createFromForm();
      this.subscribeToSaveResponse(this.postService.update(post));
    }
/!*    const post = this.createFromForm();
    if (post.id !== undefined) {
      this.subscribeToSaveResponse(this.postService.update(post));
    } else {
      this.subscribeToSaveResponse(this.postService.create(post));
    }*!/
  }

  private updateFromForm(post: IPost): IPost {
    return {
      ...new Post(),
      id: post.id, // tylko id zostaje
      postContent: this.editForm.get(['postContent']).value,
      date: moment(new Date(now()), DATE_TIME_FORMAT), // aktualna data
      tags: this.editForm.get(['tags']).value
    };
  }

  private createFromForm(): IPost {
    return {
      ...new Post(),
      id: this.editForm.get(['id']).value,
      postContent: this.editForm.get(['postContent']).value,
      date: moment(new Date(now()), DATE_TIME_FORMAT), // aktualna data
      tags: this.editForm.get(['tags']).value
    };
  }

  private createEmptyPost(): IPost {
    return {
      ...new Post(),
      id: null,
      postContent: null,
      date: null,
      tags: null
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPost>>) {
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

  trackTagByName(index: number, item: ITag) {
    return item.name;
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

  addAudioFile() {

  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }
}
*/
