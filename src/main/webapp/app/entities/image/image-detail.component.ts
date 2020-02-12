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
  imageToShow: any;
  isImageLoading: boolean;

  constructor(protected activatedRoute: ActivatedRoute, protected imageService: ImageService) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ image }) => {
      this.image = image;
    });
    this.getImageFromService();
  }

  getImageFromService() {
    this.isImageLoading = true;
    this.imageService.getFile(this.image.id).subscribe(
      data => {
        this.createImageFromBlob(data);
        this.isImageLoading = false;
      },
      error => {
        this.isImageLoading = false;
        console.error(error);
      }
    );
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.imageToShow = reader.result;
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
}
