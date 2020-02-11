import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private userExtraService: UserExtraService,
    private tagService: TagService,
    private postService: PostService,
    private audioFileService: AudioFileService,
    protected accountService: AccountService,
    protected userService: UserService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(({ user }) => {
      this.user = user.body ? user.body : user;
    });
    // console.error("this user: " + this.user.id);
    this.userExtraService.find(this.user.id).subscribe(res => {
      this.userExtra = res.body;
    });

    this.tagService.findUserTags(this.user.login).subscribe(res => {
      this.userTags = res.body;
    });

    this.postService.getUserPosts(this.user.login).subscribe(res => {
      this.userPosts = res.body;
    });

    this.audioFileService.getUserFiles(this.user.id).subscribe(res => {
      this.userAudioFiles = res.body;
    });

    this.userService.getAvatarFilename(this.user.login).subscribe(avatarFileName => {
      // console.error("Avatar filename: " + avatarFileName.body)
      this.userService.getAvatar(avatarFileName.body).subscribe(
        res => {
          const imageUrl = URL.createObjectURL(res);
          console.error('imageUrl: ' + imageUrl);
          this.avatar = document.querySelector('img');
          this.avatar.addEventListener('load', () => URL.revokeObjectURL(imageUrl));
          document.querySelector('img').src = imageUrl;
          // console.error('img file: ' + this.avatar);
        },
        res => {
          console.error('Image resource error: ' + res);
        }
      );
    });
  }

  previousState() {
    window.history.back();
  }
}
