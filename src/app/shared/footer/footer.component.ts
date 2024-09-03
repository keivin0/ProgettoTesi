import { Component, ViewChild } from '@angular/core';
import { ImageEditorComponent } from '../image-editor/image-editor.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  @ViewChild(ImageEditorComponent) imageEditor!: ImageEditorComponent;
  constructor(private routes: Router) {}
  zoomLevel: number = 100;

  goToHomePage() {
    this.routes.navigate(['home']);
  }

  zoomIn() {
    if (this.zoomLevel < 240) {
      this.zoomLevel += 20;
      this.imageEditor.applyTransform(this.zoomLevel / 100);
    }
  }

  zoomOut() {
    if (this.zoomLevel > 20) {
      this.zoomLevel -= 20;
      this.imageEditor.applyTransform(this.zoomLevel / 100);
    }
  }

  save() {
    this.imageEditor.saveImage();
    this.routes.navigate(['file-saved']);
  }
}
