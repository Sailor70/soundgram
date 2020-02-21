import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ITag, Tag } from 'app/shared/model/tag.model';
import { TagService } from 'app/entities/tag/tag.service';
import { now } from 'moment';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { ImageService } from 'app/entities/image/image.service';
import { UserService } from 'app/core/user/user.service';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { IImage } from 'app/shared/model/image.model';

@Component({
  selector: 'jhi-post-update',
  templateUrl: './post-update.component.html'
})
export class PostUpdateComponent implements OnInit, OnDestroy {
  isSaving: boolean;

  allTags: ITag[];
  postTags: ITag[] = [];
  tagsToAdd: ITag[] = [];
  // users: IUser[];

  selectedAudioFiles: FileList;
  selectedImages: FileList;
  currentAudioFile: File;
  audio: HTMLAudioElement;
  currentImage: File;
  displayImage: any;
  msg: any;

  currentPost: IPost;
  success: boolean;
  account: Account;
  // currentUser: IUser;
  editMode = false;
  newAudioSelected = false;
  newImageSelected = false;

  editForm = this.fb.group({
    id: [],
    postContent: [],
    date: [],
    tags: [],
    user: []
  });

  tagForm = this.fb.group({
    tagName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]*$')]]
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected postService: PostService,
    protected tagService: TagService,
    protected audioFileService: AudioFileService,
    protected imageService: ImageService,
    protected activatedRoute: ActivatedRoute,
    protected userService: UserService,
    protected accountService: AccountService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.success = false;
    this.isSaving = false;
    this.audio = new Audio();
    this.activatedRoute.data.subscribe(({ post }) => {
      this.updateForm(post);
      this.currentPost = post;
      // console.error('tags length' + this.currentPost.tags.length);
      if (post.id !== undefined) {
        this.editMode = true;
        this.loadMediaResources();
      }
    });
    this.tagService
      .query()
      .subscribe((res: HttpResponse<ITag[]>) => (this.allTags = res.body), (res: HttpErrorResponse) => this.onError(res.message));

    /*    this.accountService.identity().subscribe((account: Account) => {
          this.account = account;
          console.error('user account name: ' + this.account.login);
          this.userService.find(this.account.login).subscribe(res => (this.currentUser = res));
        });*/
  }

  ngOnDestroy(): void {
    for (const tag of this.tagsToAdd) {
      this.currentPost.tags.push(tag);
    }
    this.postService.update(this.currentPost).subscribe();
  }

  updateForm(post: IPost) {
    this.editForm.patchValue({
      id: post.id,
      postContent: post.postContent,
      date: post.date != null ? post.date.format(DATE_TIME_FORMAT) : null,
      tags: post.tags,
      user: post.user // jak edytujemy to nie nullujemy usera
    });
    if (post.tags !== undefined) {
      this.postTags = post.tags;
    }
  }

  previousState() {
    window.history.back();
  }

  save() {
    if (this.newAudioSelected) this.currentAudioFile = this.selectedAudioFiles.item(0);
    if (this.newImageSelected) this.currentImage = this.selectedImages.item(0);
    this.isSaving = true;
    this.createOrAssignTagToPost(); // dodajemy tagi do posta na koniec w onDestroy
    const post = this.createFromForm();
    // console.error('tags to add: ' + post.tags.length + ' ' + post.tags); // tego jest 0
    if (post.id !== undefined) {
      console.error('update post (content) ' + post.postContent);
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
      tags: [], // nie dodawać?
      user: null // pobrany na backendzie
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPost>>) {
    result.subscribe(res => this.onSaveSuccess(res), res => this.onSaveError(res));
  }

  protected onSaveSuccess(res: HttpResponse<IPost>) {
    this.currentPost = res.body;
    console.error('currentPost: {]', this.currentPost.id);

    if (this.editMode) {
      // jeśli tryb edycji to usuwamy stare pliki i zapisujemy nowe
      if (this.newAudioSelected) {
        this.audioFileService.findByPost(this.currentPost.id).subscribe(audioFile => {
          this.audioFileService.delete(audioFile.body.id);
        });
        this.audioFileService.create(this.currentAudioFile, this.currentPost.id).subscribe();
      }
      if (this.newImageSelected) {
        this.imageService.findByPost(this.currentPost.id).subscribe(audioFile => {
          this.imageService.delete(audioFile.body.id);
        });
        this.imageService.create(this.currentImage, this.currentPost.id).subscribe();
      }
    } else {
      this.audioFileService.create(this.currentAudioFile, this.currentPost.id).subscribe();
      this.imageService.create(this.currentImage, this.currentPost.id).subscribe();
    }

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

  selectAudioFile(event) {
    this.selectedAudioFiles = event.target.files;
    this.newAudioSelected = true;
  }

  selectImage(event) {
    this.selectedImages = event.target.files;
    // if(this.editMode) {
    this.newImageSelected = true;
    // }
  }

  makeNewTag() {
    const newTagName = this.tagForm
      .get(['tagName'])
      .value.toString()
      .toLowerCase();
    this.postTags.push({
      ...new Tag(),
      id: undefined,
      name: newTagName,
      posts: []
    });
    this.tagForm.get('tagName').setValue('');
  }

  createOrAssignTagToPost() {
    for (const tagToAdd of this.postTags) {
      let toCreate = true;
      for (const tag of this.allTags) {
        if (tagToAdd.name === tag.name) {
          // this.assignTagToPost(tag); // przesyłamy tag bo tagToAdd może mieć niepełne info
          this.tagsToAdd.push(tag);
          console.error('Dodano istniejący tag ' + tag.name);
          toCreate = false;
          break; // wychodzi z środkowej pętli
        }
      }
      if (toCreate) {
        this.createNewTag(tagToAdd);
      }
    }
  }

  createNewTag(tag: ITag) {
    this.tagService.create(tag).subscribe(res => {
      this.tagsToAdd.push(res.body);
    });
  }

  deleteTagFromPost(tagToDelete: ITag) {
    const tagIndex = this.postTags.findIndex(ut => ut.name === tagToDelete.name);
    if (tagIndex > -1) {
      this.postTags.splice(tagIndex, 1);
    }
  }

  loadMediaResources() {
    this.audioFileService.findByPost(this.currentPost.id).subscribe(
      (afRes: HttpResponse<IAudioFile>) => {
        const audioFile = afRes.body;
        this.audioFileService.getFile(audioFile.id).subscribe(
          res => {
            const blobUrl = URL.createObjectURL(res);
            this.currentAudioFile = new File([res], 'plik.mp3'); // this.blobToAudio(res, "plik.mp3");
            this.audio.src = blobUrl;
          },
          (res: HttpResponse<IAudioFile>) => {
            console.error('File resource error: ' + res);
          }
        );
      },
      res => {
        console.error('Audio load error: ' + res.body);
      }
    );

    this.imageService.findByPost(this.currentPost.id).subscribe(
      (res: HttpResponse<IImage>) => {
        const image = res.body;
        this.getPostImageFromService(image);
        console.error('image id:' + image.id);
      },
      res => {
        console.error('Image load error: ' + res.body);
      }
    );
  }

  getPostImageFromService(image: IImage) {
    this.imageService.getFile(image.id).subscribe(
      data => {
        this.createImageFromBlob(data);
      },
      error => {
        console.error(error);
      }
    );
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.displayImage = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  playAudio() {
    if (!this.audio.paused) {
      this.audio.load();
      this.audio.play();
    } else {
      this.audio.play();
    }
  }
  pauseAudio() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }
}
