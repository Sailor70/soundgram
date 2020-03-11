import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'app/core/user/user.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { TagService } from 'app/entities/tag/tag.service';
import { PostService } from 'app/entities/post/post.service';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { ITag } from 'app/shared/model/tag.model';
import { IPost } from 'app/shared/model/post.model';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { ITEMS_PER_PAGE_POST_OBJ } from 'app/shared/constants/pagination.constants';
import { HttpHeaders } from '@angular/common/http';
import { JhiParseLinks } from 'ng-jhipster';

@Component({
  selector: 'jhi-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  user: User;
  account: Account;
  avatar: any;
  userExtra: IUserExtra;
  userTags: ITag[];
  userPosts: IPost[];
  userAudioFiles: IAudioFile[];

  hasImage: boolean;
  isImageLoading: boolean;

  showPosts = false;

  itemsPerPage: number;
  links: any;
  page: any;
  totalItems: number;

  constructor(
    private route: ActivatedRoute,
    private userExtraService: UserExtraService,
    private tagService: TagService,
    private postService: PostService,
    private audioFileService: AudioFileService,
    protected accountService: AccountService,
    protected userService: UserService,
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
    this.route.data.subscribe(({ user }) => {
      this.user = user.body ? user.body : user;
      this.getAvatarFromService();
    });
    this.hasImage = false;
    // console.error("this user: " + this.user.id);
    this.userExtraService.find(this.user.id).subscribe(res => {
      this.userExtra = res.body;
    });

    this.tagService.findUserTags(this.user.login).subscribe(res => {
      this.userTags = res.body;
    });

    this.loadPosts();

    this.audioFileService.getUserFiles(this.user.id).subscribe(res => {
      this.userAudioFiles = res.body;
    });
  }

  loadPosts() {
    this.postService
      .getUserPosts(this.user.login, {
        page: this.page,
        size: this.itemsPerPage,
        sort: ['date' + ',' + 'desc'] // sortuje posty od najnowszego według daty
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

  loadPage(page) {
    this.page = page;
    this.loadPosts();
  }

  protected paginatePosts(data: IPost[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    for (let i = 0; i < data.length; i++) {
      console.error('post to paginate id: ' + data[i].id);
      this.userPosts.push(data[i]);
    }
  }

  getAvatarFromService() {
    this.isImageLoading = true;
    this.userService.getAvatarFilename(this.user.login).subscribe(avatarFileName => {
      // console.error('avatar filename: ' + avatarFileName.body);
      if (avatarFileName.body) {
        // console.error('wykonało się');
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

  previousState() {
    window.history.back();
  }

  showPostsSection() {
    this.showPosts = !this.showPosts;
  }

  openUserFilesAtMusic() {
    this.router.navigate(['music/', this.user.login, 'play']); // , this.user.id, 'view'
  }
}
