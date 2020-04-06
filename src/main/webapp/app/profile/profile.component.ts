import { Component, OnInit } from '@angular/core';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { TagService } from 'app/entities/tag/tag.service';
import { PostService } from 'app/entities/post/post.service';
import { ITag, Tag } from 'app/shared/model/tag.model';
import { IPost } from 'app/shared/model/post.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { FormBuilder, Validators } from '@angular/forms';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { PostDeleteDialogComponent } from 'app/entities/post/post-delete-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ITEMS_PER_PAGE_POST_OBJ } from 'app/shared/constants/pagination.constants';
import { HttpHeaders } from '@angular/common/http';
import { JhiParseLinks } from 'ng-jhipster';

// import { Account } from "app/core/user/user.service";

@Component({
  selector: 'jhi-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: IUser;
  userTags: ITag[];
  userPosts: IPost[];
  // userAudioFiles: IAudioFile[];
  account: Account;

  allTags: ITag[];
  success: boolean;

  avatar: any;
  hasImage: boolean;
  isImageLoading: boolean;
  userExtra: IUserExtra;
  showPosts = false;

  itemsPerPage: number;
  links: any;
  page: any;
  totalItems: number;

  tagForm = this.fb.group({
    tagName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]*$')]]
  });

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private tagService: TagService,
    private postService: PostService,
    private audioFileService: AudioFileService,
    private userExtraService: UserExtraService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    protected parseLinks: JhiParseLinks
  ) {
    this.userPosts = [];
    this.itemsPerPage = ITEMS_PER_PAGE_POST_OBJ;
    this.page = 0;
    this.links = {
      last: 0
    };
  }

  ngOnInit() {
    this.hasImage = false;
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.identificationSuccess();
    });

    this.success = false;
    this.tagService.query().subscribe(res => {
      this.allTags = res.body;
    });
  }

  identificationSuccess() {
    this.userService.find(this.account.login).subscribe(res => {
      this.user = res;

      this.userExtraService.find(this.user.id).subscribe(extraRes => {
        this.userExtra = extraRes.body;
      });

      // this.audioFileService.getUserFiles(this.user.id).subscribe(audioRes => {
      //   this.userAudioFiles = audioRes.body;
      //   console.error('audioFiles: ' + this.userAudioFiles.length);
      // });
    });

    this.getAvatarFromService();
    this.refreshTags(); // load tags

    this.loadPosts();
  }

  sort() {
    const result = ['date' + ',' + 'desc']; // sortuje posty od najnowszego według daty
    // if (this.predicate !== 'id') {
    // result.push('id');
    // }
    return result;
  }

  loadPage(page) {
    this.page = page;
    this.loadPosts();
  }

  refreshTags() {
    this.tagService.findUserTags(this.account.login).subscribe(res => {
      this.userTags = res.body;
      console.error('tags: ' + this.userTags.length);
    });
  }

  loadPosts() {
    this.postService
      .getUserPosts(this.account.login, {
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort()
      })
      .subscribe(
        res => {
          this.paginatePosts(res.body, res.headers);
          // this.userPosts = res.body;
          console.error('posts: ' + this.userPosts.length);
        },
        res => {
          console.error('posts error: ' + res.body);
        }
      );
  }

  protected paginatePosts(data: IPost[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    for (let i = 0; i < data.length; i++) {
      console.error('post to paginate id: ' + data[i].id);
      this.userPosts.push(data[i]);
    }
  }

  addTagToProfile() {
    const newTagName = this.tagForm
      .get(['tagName'])
      .value.toString()
      .toLowerCase();
    this.tagForm.get(['tagName']).setValue('');
    let tagToAdd = null;
    for (const tag of this.allTags) {
      if (tag.name === newTagName) {
        tagToAdd = tag;
        break;
      }
    }
    if (tagToAdd === null) {
      tagToAdd = {
        ...new Tag(),
        id: undefined,
        name: newTagName,
        users: this.user
      };
      this.tagService.create(tagToAdd).subscribe(res => {
        this.userTags.push(res.body); // add new tag to user
      });
    } else {
      this.tagService.addUserToTag(tagToAdd).subscribe(() => {
        // this.userTags.push(res.body);
        this.refreshTags();
      });
    }
  }

  deleteTagFromProfile(tag: ITag) {
    const tagUsers = tag.users;
    const userIndex = tagUsers.findIndex(ut => ut.login === this.user.login);
    if (userIndex > -1) {
      tagUsers.splice(userIndex, 1);
    }
    tag.users = tagUsers;
    this.tagService.update(tag).subscribe(() => {
      this.refreshTags();
    });
  }

  getAvatarFromService() {
    this.isImageLoading = true;
    this.userService.getAvatarFilename(this.account.login).subscribe(avatarFileName => {
      if (avatarFileName.body) {
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

  delete(post: IPost) {
    const modalRef = this.modalService.open(PostDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.post = post;
  }

  showPostsSection() {
    this.showPosts = !this.showPosts;
  }

  openUserFilesAtMusic() {
    this.router.navigate(['music/', this.user.login, 'play']); // , this.user.id, 'view'
  }
}
