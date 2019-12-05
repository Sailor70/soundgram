import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';
import { IImage, Image } from 'app/shared/model/image.model';
import { ImageService } from './image.service';
import { IPost } from 'app/shared/model/post.model';
import { PostService } from 'app/entities/post/post.service';

@Component({
  selector: 'jhi-image-update',
  templateUrl: './image-update.component.html'
})
export class ImageUpdateComponent implements OnInit {
  isSaving: boolean;

  posts: IPost[];

  editForm = this.fb.group({
    id: [],
    path: [null, [Validators.required]],
    name: [],
    post: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected imageService: ImageService,
    protected postService: PostService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ image }) => {
      this.updateForm(image);
    });
    this.postService
      .query()
      .subscribe((res: HttpResponse<IPost[]>) => (this.posts = res.body), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(image: IImage) {
    this.editForm.patchValue({
      id: image.id,
      path: image.path,
      name: image.name,
      post: image.post
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const image = this.createFromForm();
    if (image.id !== undefined) {
      this.subscribeToSaveResponse(this.imageService.update(image));
    } else {
      this.subscribeToSaveResponse(this.imageService.create(image));
    }
  }

  private createFromForm(): IImage {
    return {
      ...new Image(),
      id: this.editForm.get(['id']).value,
      path: this.editForm.get(['path']).value,
      name: this.editForm.get(['name']).value,
      post: this.editForm.get(['post']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IImage>>) {
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

  trackPostById(index: number, item: IPost) {
    return item.id;
  }
}
