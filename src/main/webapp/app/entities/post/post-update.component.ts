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
import { ITag, Tag } from 'app/shared/model/tag.model';
import { TagService } from 'app/entities/tag/tag.service';
import { now } from 'moment';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { ImageService } from 'app/entities/image/image.service';
import { UserService } from 'app/core/user/user.service';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-post-update',
  templateUrl: './post-update.component.html'
})
export class PostUpdateComponent implements OnInit {
  isSaving: boolean;

  allTags: ITag[];
  postTags: ITag[] = [];
  tagsToAdd: ITag[] = [];
  // users: IUser[];

  selectedAudioFiles: FileList;
  selectedImages: FileList;
  currentAudioFile: File;
  currentImage: File;
  msg: any;

  currentPost: IPost;
  success: boolean;
  ready = false;
  account: Account;
  // currentUser: IUser;

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
    this.activatedRoute.data.subscribe(({ post }) => {
      this.updateForm(post);
      this.currentPost = post;
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
    this.currentAudioFile = this.selectedAudioFiles.item(0);
    this.currentImage = this.selectedImages.item(0);
    this.isSaving = true;
    this.createOrAssignTagToPost(); // trzeba poczekać aż to się wszystko wykona
    const post = this.createFromForm();
    console.error('tags to add: ' + post.tags.length + ' ' + post.tags); // tego jest 0
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
      tags: this.tagsToAdd,
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
        if (tagToAdd.name === tag) {
          // this.assignTagToPost(tag); // przesyłamy tag bo tagToAdd może mieć niepełne info
          this.tagsToAdd.push(tag);
          toCreate = false;
          break; // wychodzi z środkowej pętli
        }
      }
      if (toCreate) {
        this.createNewTag(tagToAdd);
      }
    }
    this.ready = true;
  }

  assignTagToPost(tag: ITag) {
    // if tag exists
    tag.posts.push(this.currentPost);
    this.tagService.update(tag).subscribe(res => {
      this.currentPost = res.body;
    });
  }

  createNewTag(tag: ITag) {
    // create and assign post to tag
    // tag.posts.push(this.currentPost);
    this.tagService.create(tag).subscribe(res => {
      this.tagsToAdd.push(res.body);
    });
  }

  deleteTagFromPost(tag: ITag) {
    const tagPosts = tag.posts;
    const postIndex = tagPosts.findIndex(ut => ut.id === this.currentPost.id);
    if (postIndex > -1) {
      tagPosts.splice(postIndex, 1);
    }
    tag.posts = tagPosts;
    this.tagService.update(tag).subscribe(() => {
      this.postService.find(this.currentPost.id).subscribe(res => {
        this.currentPost = res.body;
      });
    });
  }
}
