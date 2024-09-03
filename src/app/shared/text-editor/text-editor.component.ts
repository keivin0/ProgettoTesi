import { Component, ViewChild } from '@angular/core';
import { ImageEditorComponent } from '../image-editor/image-editor.component';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css'],
})
export class TextEditorComponent {
  text: string = 'Text';
  color: string = 'black';
  fontSize: number = 16;
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  fontStyle: string = 'Arial';
  selectedBoxId: number | null = null;

  @ViewChild(ImageEditorComponent) imageEditor!: ImageEditorComponent;

  addTextBox() {
    this.imageEditor.addTextBox(this.text, this.applyStyles());
  }

  triggerColorInput() {
    document.getElementById('colorInput')?.click();
  }

  onColorSelected(event: any) {
    this.color = event.target.value;
    this.updateSelectedBoxStyle();
  }

  changeFontStyle(event: any) {
    this.fontStyle = event.target.value;
    this.updateSelectedBoxStyle();
  }

  makeBold() {
    this.isBold = !this.isBold;
    this.updateSelectedBoxStyle();
  }

  makeItalic() {
    this.isItalic = !this.isItalic;
    this.updateSelectedBoxStyle();
  }

  underline() {
    this.isUnderline = !this.isUnderline;
    this.updateSelectedBoxStyle();
  }

  updateSelectedBoxStyle() {
    if (this.selectedBoxId !== null) {
      this.imageEditor.updateTextBoxStyle(
        this.selectedBoxId,
        this.applyStyles()
      );
    }
  }

  applyStyles() {
    let fontWeight = this.isBold ? 'bold' : 'normal';
    let fontStyle = this.isItalic ? 'italic' : 'normal';
    let textDecoration = this.isUnderline ? 'underline' : 'none';

    return {
      color: this.color,
      'font-size': `${this.fontSize}px`,
      'font-weight': fontWeight,
      'font-style': fontStyle,
      'text-decoration': textDecoration,
      'font-family': this.fontStyle,
    };
  }
}
