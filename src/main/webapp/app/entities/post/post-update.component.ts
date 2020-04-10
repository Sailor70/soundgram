import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'jhi-post-update',
  templateUrl: './post-update.component.html',
  styleUrls: ['./post.scss']
})
export class PostUpdateComponent implements OnInit {
  isSaving: boolean;
  pageTitle = 'Create new Post';
  chooseAudio = 'Choose Audio';
  chooseImage = 'Choose Image';

  allTags: ITag[];
  postTags: ITag[] = []; // current / tags loaded from database
  tagsToAdd: ITag[] = []; // final list of tags that should be assigned to post at save()
  // users: IUser[];

  selectedAudioFiles: FileList;
  selectedImages: FileList;
  currentAudioFile: File;
  audioFile: IAudioFile;
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
    user: [],
    imageFile: [
      '',
      [
        RxwebValidators.extension({ extensions: ['jpg', 'png', 'jpeg'] }),
        // RxwebValidators.image({ maxHeight: 1000, maxWidth: 1000 }),
        RxwebValidators.file({ minFiles: 1, maxFiles: 1 }),
        RxwebValidators.fileSize({ maxSize: 5000000 }) // 5 MB
      ]
    ],
    audioFile: [
      '',
      [
        RxwebValidators.extension({ extensions: ['mp3'] }),
        RxwebValidators.file({ minFiles: 1, maxFiles: 1 }),
        RxwebValidators.fileSize({ maxSize: 8000000 }) // 8 MB
      ]
    ]
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
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.success = false;
    this.isSaving = false;
    this.audio = new Audio();
    this.activatedRoute.data.subscribe(({ post }) => {
      console.error('nowy post id : ' + post.id);
      this.updateForm(post);
      this.currentPost = post;
      // console.error('tags length' + this.currentPost.tags.length);
      if (post.id !== undefined) {
        console.error('edytujemy post: ' + post.id);
        this.editMode = true;
        this.pageTitle = 'Edit Post';
        this.loadMediaResources();
      }
      this.loadAllTagsAndPostTags();
    });

    /*    this.accountService.identity().subscribe((account: Account) => {
          this.account = account;
          console.error('user account name: ' + this.account.login);
          this.userService.find(this.account.login).subscribe(res => (this.currentUser = res));
        });*/
  }

  // ngOnDestroy(): void {
  //   for (const tag of this.tagsToAdd) {
  //     this.currentPost.tags.push(tag);
  //   }
  //   this.postService.update(this.currentPost).subscribe();
  // }

  updateForm(post: IPost) {
    this.editForm.patchValue({
      id: post.id,
      postContent: post.postContent,
      date: post.date != null ? post.date.format(DATE_TIME_FORMAT) : null,
      tags: post.tags,
      user: post.user // jak edytujemy to nie nullujemy usera
    });
    // if (post.tags !== undefined) {
    //   this.postTags = this.tagService. post.tags;
    //   // console.error('postTags: ' + this.postTags[1].users.length);
    // }
  }

  loadAllTagsAndPostTags() {
    this.tagService.query().subscribe(
      (res: HttpResponse<ITag[]>) => {
        this.allTags = res.body;
        if (this.currentPost.tags) {
          for (const postTag of this.currentPost.tags) {
            for (const tag of this.allTags) {
              if (tag.id === postTag.id) {
                this.postTags.push(tag);
              }
            }
          }
        }
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  previousState() {
    // this.router.navigateByUrl(['/post', this.currentPost.id+'view', { skipLocationChange: true }).then(() => {
    // this.router.navigate(['/post', this.currentPost.id, 'view' ]);
    // });
    window.history.back();
  }

  save() {
    if (this.newAudioSelected) this.currentAudioFile = this.selectedAudioFiles.item(0);
    if (this.newImageSelected) this.currentImage = this.selectedImages.item(0);
    this.isSaving = true;
    this.createOrAssignTagToPost().then(() => {
      const post = this.createFromForm();
      // console.error('tags to add: ' + post.tags.length + ' ' + post.tags); // tego jest 0
      if (post.id !== undefined) {
        console.error('update post (content) ' + post.postContent);
        this.subscribeToSaveResponse(this.postService.update(post));
      } else {
        this.subscribeToSaveResponse(this.postService.create(post));
      }
    });
  }

  private createFromForm(): IPost {
    return {
      ...new Post(),
      id: this.editForm.get(['id']).value,
      postContent: this.editForm.get(['postContent']).value,
      date: moment(new Date(now()), DATE_TIME_FORMAT), // aktualna data
      tags: this.tagsToAdd, // []
      user: null // pobrany na backendzie
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPost>>) {
    result.subscribe(res => this.onSaveSuccess(res), res => this.onSaveError(res));
  }

  protected onSaveSuccess(res: HttpResponse<IPost>) {
    this.currentPost = res.body;
    console.error('currentPost: ', this.currentPost.id);
    const promises = [];
    if (this.editMode) {
      // jeśli tryb edycji to usuwamy stare pliki i zapisujemy nowe
      if (this.newAudioSelected) {
        promises.push(
          new Promise(resolve => {
            this.audioFileService.findByPost(this.currentPost.id).subscribe(
              audioFile => {
                this.audioFileService.delete(audioFile.body.id).subscribe(() => {
                  this.audioFileService.create(this.currentAudioFile, this.currentPost.id).subscribe(() => resolve());
                });
              },
              () => {
                this.audioFileService.create(this.currentAudioFile, this.currentPost.id).subscribe(() => resolve());
              }
            );
          })
        );
      }
      if (this.newImageSelected) {
        promises.push(
          new Promise(resolve => {
            this.imageService.findByPost(this.currentPost.id).subscribe(
              image => {
                this.imageService.delete(image.body.id).subscribe(() => {
                  this.imageService.create(this.currentImage, this.currentPost.id).subscribe(() => resolve());
                });
              },
              () => {
                this.imageService.create(this.currentImage, this.currentPost.id).subscribe(() => resolve());
              }
            );
          })
        );
      }
    } else {
      promises.push(
        new Promise(resolve => {
          this.audioFileService.create(this.currentAudioFile, this.currentPost.id).subscribe(() => resolve());
        })
      );
      promises.push(
        new Promise(resolve => {
          this.imageService.create(this.currentImage, this.currentPost.id).subscribe(() => resolve());
        })
      );
    }

    // wait for cereate new files and then previousState
    Promise.all(promises).then(() => {
      this.selectedAudioFiles = null;
      this.selectedImages = null;
      this.isSaving = false;
      this.previousState();
    });
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
    this.chooseAudio = this.selectedAudioFiles.item(0).name;
    this.newAudioSelected = true;
  }

  selectImage(event) {
    this.selectedImages = event.target.files;
    this.chooseImage = this.selectedImages.item(0).name;
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
    return new Promise(resolve => {
      const promises = [];
      for (const tagToAdd of this.postTags) {
        let toCreate = true;
        for (const tag of this.allTags) {
          if (tagToAdd.name === tag.name) {
            this.tagsToAdd.push(tag);
            console.error('Dodano istniejący tag ' + tag.name);
            toCreate = false;
            break; // wychodzi z środkowej pętli
          }
        }
        if (toCreate) {
          promises.push(this.createNewTag(tagToAdd)); // returns new Promise
        }
      }
      Promise.all(promises).then(() => {
        console.error('wszystkie promisy spełnione! a było ich: ' + promises.length);
        resolve();
      });
    });
  }

  createNewTag(tag: ITag) {
    return new Promise((resolve, reject) => {
      this.tagService.create(tag).subscribe(
        res => {
          this.tagsToAdd.push(res.body);
          console.error('Utworzono tag ' + res.body.name);
          resolve();
        },
        () => {
          reject();
        }
      );
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
        this.audioFile = afRes.body;
        this.audioFileService.getFile(this.audioFile.id).subscribe(
          res => {
            const blobUrl = URL.createObjectURL(res);
            this.currentAudioFile = new File([res], this.audioFile.title); // this.blobToAudio(res, "plik.mp3");
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
}
