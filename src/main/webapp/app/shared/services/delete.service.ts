import { Injectable } from '@angular/core';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { PostService } from 'app/entities/post/post.service';
import { ImageService } from 'app/entities/image/image.service';

@Injectable({ providedIn: 'root' })
export class DeleteService {
  constructor(private audioFileService: AudioFileService, private postService: PostService, private imageService: ImageService) {}

  deletePost(id: number) {
    this.audioFileService.findByPost(id).subscribe(audioFile => {
      this.audioFileService.delete(audioFile.body.id).subscribe(() => {
        this.imageService.findByPost(id).subscribe(image => {
          this.imageService.delete(image.body.id).subscribe();
        });
      });
    });
  }
}
