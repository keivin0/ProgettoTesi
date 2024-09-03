import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private image!: File | null;
  private imageSrc!: string;

  setImage(file: File) {
    this.image = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  getImage(): File | null {
    return this.image;
  }

  getImageSrc(): string {
    return this.imageSrc;
  }

  removeImage() {
    this.image = null;
    this.imageSrc = '';
  }
}
