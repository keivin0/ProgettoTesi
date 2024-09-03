import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { ImageEditorComponent } from './image-editor/image-editor.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { WatermarkComponent } from './watermark/watermark.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    FooterComponent,
    ImageEditorComponent,
    TextEditorComponent,
    WatermarkComponent,
  ],
  imports: [CommonModule, FormsModule, BrowserModule],
  exports: [
    FooterComponent,
    ImageEditorComponent,
    TextEditorComponent,
    WatermarkComponent,
  ],
})
export class SharedModule {}
