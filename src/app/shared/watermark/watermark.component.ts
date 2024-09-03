import { Component, ViewChild } from '@angular/core';
import { ImageEditorComponent } from '../image-editor/image-editor.component';

@Component({
  selector: 'app-watermark',
  templateUrl: './watermark.component.html',
  styleUrl: './watermark.component.css',
})
export class WatermarkComponent {
  watermarkText: string = '';
  hasWatermark: boolean = false;

  @ViewChild(ImageEditorComponent) imageEditor!: ImageEditorComponent;
  private watermarkCanvas: HTMLCanvasElement = document.createElement('canvas');
  private watermarkContext = this.watermarkCanvas.getContext('2d')!;

  addWatermark() {
    if (this.hasWatermark) return;

    const imageEditorCanvas = this.imageEditor.getCanvas();
    this.watermarkCanvas.width = imageEditorCanvas.width;
    this.watermarkCanvas.height = imageEditorCanvas.height;

    this.watermarkContext.font = '30px Arial';
    this.watermarkContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.watermarkContext.globalAlpha = 0.5;
    this.watermarkContext.translate(
      this.watermarkCanvas.width / 2,
      this.watermarkCanvas.height / 2
    );
    this.watermarkContext.rotate(-Math.PI / 4);
    for (
      let i = -this.watermarkCanvas.width;
      i < this.watermarkCanvas.width;
      i += 200
    ) {
      for (
        let j = -this.watermarkCanvas.height;
        j < this.watermarkCanvas.height;
        j += 100
      ) {
        this.watermarkContext.fillText(this.watermarkText, i, j);
      }
    }
    this.watermarkContext.rotate(Math.PI / 4);
    this.watermarkContext.translate(
      -this.watermarkCanvas.width / 2,
      -this.watermarkCanvas.height / 2
    );
    this.watermarkContext.globalAlpha = 1.0;

    this.imageEditor.addWatermarkImage(this.watermarkCanvas);
    this.hasWatermark = true;
  }

  removeWatermark() {
    if (!this.hasWatermark) return;

    // Redraw the image without watermark
    this.imageEditor.removeWatermarkImage();
    this.hasWatermark = false;
  }
}
