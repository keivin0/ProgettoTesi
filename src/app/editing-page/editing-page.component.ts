import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ImageEditorComponent } from '../shared/image-editor/image-editor.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { TextEditorComponent } from '../shared/text-editor/text-editor.component';
import { WatermarkComponent } from '../shared/watermark/watermark.component';
@Component({
  selector: 'app-editing-page',
  templateUrl: './editing-page.component.html',
  styleUrl: './editing-page.component.css',
})
export class EditingPageComponent implements AfterViewInit {
  @ViewChild(ImageEditorComponent) imageEditor!: ImageEditorComponent;
  @ViewChild(FooterComponent) footer!: FooterComponent;
  @ViewChild(TextEditorComponent) textEditor!: TextEditorComponent;
  @ViewChild(WatermarkComponent) watermark!: WatermarkComponent;

  ngAfterViewInit() {
    // Collega i componenti con ImageEditorComponent
    if (this.textEditor && this.imageEditor) {
      this.textEditor.imageEditor = this.imageEditor;
    }
    if (this.watermark && this.imageEditor) {
      this.watermark.imageEditor = this.imageEditor;
    }
    if (this.footer && this.imageEditor) {
      this.footer.imageEditor = this.imageEditor;
    }
  }
}
