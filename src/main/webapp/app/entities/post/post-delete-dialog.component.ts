import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IPost } from 'app/shared/model/post.model';
import { PostService } from './post.service';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { ImageService } from 'app/entities/image/image.service';

@Component({
  templateUrl: './post-delete-dialog.component.html'
})
export class PostDeleteDialogComponent {
  post: IPost;

  constructor(
    protected postService: PostService,
    public activeModal: NgbActiveModal,
    private audioFileService: AudioFileService,
    private imageService: ImageService,
    protected eventManager: JhiEventManager
  ) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  // delete audioFile and Image first
  confirmDelete(id: number) {
    this.audioFileService.findByPost(id).subscribe(audioFile => {
      this.audioFileService.delete(audioFile.body.id).subscribe(() => {
        this.imageService.findByPost(id).subscribe(image => {
          this.imageService.delete(image.body.id).subscribe(() => {
            this.postService.delete(id).subscribe(() => {
              this.eventManager.broadcast({
                name: 'postListModification',
                content: 'Deleted an post'
              });
              this.activeModal.dismiss(true);
            });
          });
        });
      });
    });
    // this.imageService.findByPost(id).subscribe( image => {
    //   this.imageService.delete(image.body.id).subscribe();
    // });
    // this.postService.delete(id).subscribe(() => {
    //   this.eventManager.broadcast({
    //     name: 'postListModification',
    //     content: 'Deleted an post'
    //   });
    //   this.activeModal.dismiss(true);
    // });
  }
}
