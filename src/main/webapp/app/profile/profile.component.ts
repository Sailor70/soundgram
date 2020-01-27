import { Component, OnInit } from '@angular/core';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { TagService } from 'app/entities/tag/tag.service';
import { PostService } from 'app/entities/post/post.service';
import { ITag } from 'app/shared/model/tag.model';
import { IPost } from 'app/shared/model/post.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { IAudioFile } from 'app/shared/model/audio-file.model';
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
  userAudioFiles: IAudioFile[];
  account: Account;

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private tagService: TagService,
    private postService: PostService,
    private audioFileService: AudioFileService
  ) {}

  ngOnInit() {
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      console.error('user account name: ' + this.account.login);
      this.identificationSuccess();
    });
  }

  identificationSuccess() {
    this.userService.find(this.account.login).subscribe(res => (this.user = res));
    this.tagService.findUserTags(this.account.login).subscribe(res => {
      this.userTags = res.body;
      console.error('tags: ' + this.userTags.length);
    });

    this.postService.getUserPosts(this.account.login).subscribe(
      res => {
        this.userPosts = res.body;
        console.error('posts: ' + this.userPosts.length);
      },
      res => {
        console.error('posts error: ' + res.body);
      }
    );

    this.audioFileService.getUserFiles().subscribe(res => {
      this.userAudioFiles = res.body;
      console.error('audioFiles: ' + this.userAudioFiles.length);
    });
  }
}
