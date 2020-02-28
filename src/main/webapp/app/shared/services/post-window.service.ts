import { Injectable } from '@angular/core';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { PostService } from 'app/entities/post/post.service';

@Injectable({ providedIn: 'root' })
export class PostWindowService {
  constructor(private audioFileService: AudioFileService, private postService: PostService) {}
}
