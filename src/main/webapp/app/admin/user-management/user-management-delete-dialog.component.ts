import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { PostService } from 'app/entities/post/post.service';
import { IPost } from 'app/shared/model/post.model';
import { ImageService } from 'app/entities/image/image.service';
import { CommentService } from 'app/entities/comment/comment.service';
import { TagService } from 'app/entities/tag/tag.service';
import { ITag } from 'app/shared/model/tag.model';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';

@Component({
  selector: 'jhi-user-mgmt-delete-dialog',
  templateUrl: './user-management-delete-dialog.component.html'
})
export class UserManagementDeleteDialogComponent {
  user: User;
  userPosts: IPost[] = [];

  constructor(
    private userService: UserService,
    public activeModal: NgbActiveModal,
    private eventManager: JhiEventManager,
    private userExtraService: UserExtraService,
    private audioFileService: AudioFileService,
    private postService: PostService,
    private imageService: ImageService,
    private commentService: CommentService,
    private tagService: TagService,
    private followedUserService: FollowedUserService
  ) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(login) {
    this.userService.find(login).subscribe(user => {
      this.user = user;
      this.deleteUserData();
    });
  }

  deleteUser() {
    this.userExtraService.delete(this.user.id).subscribe(() => {
      this.userService.delete(this.user.login).subscribe(() => {
        this.eventManager.broadcast({ name: 'userListModification', content: 'Deleted a user' });
        this.activeModal.close(true);
      });
    });
  }

  deleteUserData() {
    // delete user audio Files
    // this.audioFileService.getUserFiles(this.user.id).subscribe(userFiles => {
    //   this.userFiles = userFiles.body;
    //   for (const file of this.userFiles) {
    //     this.audioFileService.delete(file.id).subscribe();
    //   }
    // });
    // delete user Posts (and all their data)
    this.postService.getUserPosts(this.user.login).subscribe(post => {
      this.userPosts = post.body;
      for (const userPost of this.userPosts) {
        this.audioFileService.findByPost(userPost.id).subscribe(audioFile => {
          this.audioFileService.delete(audioFile.body.id).subscribe();
        });

        this.imageService.findByPost(userPost.id).subscribe(image => {
          this.imageService.delete(image.body.id).subscribe();
        });

        this.commentService.findByPost(userPost.id).subscribe(comments => {
          for (const comment of comments.body) {
            this.commentService.delete(comment.id).subscribe();
          }
        });
      }
    });
    this.tagService.findUserTags(this.user.login).subscribe(userTags => {
      for (const tag of userTags.body) {
        this.deleteTagFromProfile(tag);
      }
    });

    this.followedUserService.onUserDelete(this.user.id).subscribe(() => {
      this.deleteUser();
    });
  }

  deleteTagFromProfile(tag: ITag) {
    const tagUsers = tag.users;
    const userIndex = tagUsers.findIndex(ut => ut.login === this.user.login);
    if (userIndex > -1) {
      tagUsers.splice(userIndex, 1);
    }
    tag.users = tagUsers;
    this.tagService.update(tag).subscribe();
  }
}
