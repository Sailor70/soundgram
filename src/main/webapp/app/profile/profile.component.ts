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
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { FormBuilder, Validators } from '@angular/forms';
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

  allTags: ITag[];
  success: boolean;

  tagForm = this.fb.group({
    tagName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]*$')]]
  });

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private tagService: TagService,
    private postService: PostService,
    private audioFileService: AudioFileService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.success = false;
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      console.error('user account name: ' + this.account.login);
      this.identificationSuccess();
    });

    this.tagService.query().subscribe(res => {
      this.allTags = res.body;
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

  addTagToProfile() {
    const newTag = this.tagForm
      .get(['tagName'])
      .value.toString()
      .toLowerCase();
    let tagToAdd;
    for (let tag of this.allTags) {
      if (tag.name === newTag) {
        tagToAdd = tag;
        break;
      } else {
        tagToAdd = {
          ...new Tag(),
          id: undefined,
          name: newTag,
          users: undefined // add current user
        };
      }
    }
  }
}
