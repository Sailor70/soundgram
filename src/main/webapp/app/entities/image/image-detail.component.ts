import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IImage } from 'app/shared/model/image.model';
import { ImageService } from 'app/entities/image/image.service';

@Component({
  selector: 'jhi-image-detail',
  templateUrl: './image-detail.component.html'
})
export class ImageDetailComponent implements OnInit {
  image: IImage;
  imageUrl: any;
  img: any;

  constructor(protected activatedRoute: ActivatedRoute, protected imageService: ImageService) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ image }) => {
      this.image = image;
    });
    this.imageService.getFile(this.image.id).subscribe(
      res => {
        const blobUrl = URL.createObjectURL(res);
        this.imageUrl = blobUrl;
        console.error('imageUrl: ' + this.imageUrl);
        this.img = document.querySelector('img');
        this.img.addEventListener('load', () => URL.revokeObjectURL(this.imageUrl));
        document.querySelector('img').src = this.imageUrl;
        console.error('img file: ' + this.img);
      },
      res => {
        console.error('Image resource error: ' + res);
      }
    );
  }

  previousState() {
    window.history.back();
  }
}
