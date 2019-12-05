import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';
import { IAudioFile, AudioFile } from 'app/shared/model/audio-file.model';
import { AudioFileService } from './audio-file.service';
import { IPost } from 'app/shared/model/post.model';
import { PostService } from 'app/entities/post/post.service';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'jhi-audio-file-update',
  templateUrl: './audio-file-update.component.html'
})
export class AudioFileUpdateComponent implements OnInit {
  isSaving: boolean;

  posts: IPost[];

  users: IUser[];

  editForm = this.fb.group({
    id: [],
    audioPath: [null, [Validators.required]],
    title: [],
    iconPath: [],
    post: [],
    users: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected audioFileService: AudioFileService,
    protected postService: PostService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ audioFile }) => {
      this.updateForm(audioFile);
    });
    this.postService
      .query()
      .subscribe((res: HttpResponse<IPost[]>) => (this.posts = res.body), (res: HttpErrorResponse) => this.onError(res.message));
    this.userService
      .query()
      .subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(audioFile: IAudioFile) {
    this.editForm.patchValue({
      id: audioFile.id,
      audioPath: audioFile.audioPath,
      title: audioFile.title,
      iconPath: audioFile.iconPath,
      post: audioFile.post,
      users: audioFile.users
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const audioFile = this.createFromForm();
    if (audioFile.id !== undefined) {
      this.subscribeToSaveResponse(this.audioFileService.update(audioFile));
    } else {
      this.subscribeToSaveResponse(this.audioFileService.create(audioFile));
    }
  }

  private createFromForm(): IAudioFile {
    return {
      ...new AudioFile(),
      id: this.editForm.get(['id']).value,
      audioPath: this.editForm.get(['audioPath']).value,
      title: this.editForm.get(['title']).value,
      iconPath: this.editForm.get(['iconPath']).value,
      post: this.editForm.get(['post']).value,
      users: this.editForm.get(['users']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAudioFile>>) {
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

  trackUserById(index: number, item: IUser) {
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
