import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private routes: Router, private imageService: ImageService) {}
  file: any;
  isDisabled: boolean = true;

  triggerFileInput() {
    document.getElementById('fileInput')?.click();
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    if (this.file) {
      this.imageService.setImage(this.file);
      this.isDisabled = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.file = event?.dataTransfer?.files[0];
    if (this.file) {
      this.imageService.setImage(this.file);
      this.isDisabled = false;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  removeFile() {
    this.imageService.removeImage();
    this.file = {};
    this.isDisabled = true;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    console.log('cosa dentro', this.file);
  }

  goToEditingPage() {
    this.routes.navigate(['editing-page']);
  }
}
