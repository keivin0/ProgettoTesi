import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.css'],
})
export class ImageEditorComponent implements OnInit {
  @ViewChild('imageCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  imageSrc: string = '';
  private originalImage: HTMLImageElement = new Image();
  private watermarkImage: HTMLImageElement | null = null;
  textBoxes: {
    id: number;
    text: string;
    originalText: string;
    x: number;
    y: number;
    styles: any;
  }[] = [];
  nextId: number = 1;
  selectedBoxId: number | null = null;
  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;
  private transformMatrix: DOMMatrix = new DOMMatrix();
  private zoomLevel: number = 1;
  private watermarkCanvas: HTMLCanvasElement = document.createElement('canvas');
  private watermarkContext = this.watermarkCanvas.getContext('2d')!;
  private watermarkApplied = false;
  private clickTimeout: any = null;

  constructor(private imageService: ImageService) {}

  ngOnInit() {
    this.imageSrc = this.imageService.getImageSrc();
  }

  ngAfterViewInit() {
    this.context = this.canvasRef.nativeElement.getContext('2d')!;
    this.originalImage.src = this.imageSrc;
    this.originalImage.onload = () => {
      this.setCanvasSize(this.originalImage.width, this.originalImage.height);
      this.redrawImage();
    };
  }

  setCanvasSize(width: number, height: number) {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = width;
    canvas.height = height;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  redrawImage() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.context;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(this.transformMatrix);

    // Draw the original image
    ctx.drawImage(this.originalImage, 0, 0, canvas.width, canvas.height);

    // Draw text boxes
    this.drawTextBoxes();

    // Draw watermark
    if (this.watermarkApplied && this.watermarkImage) {
      ctx.drawImage(this.watermarkImage, 0, 0, canvas.width, canvas.height);
    }
  }

  drawTextBoxes() {
    // this.textBoxes.forEach((box) => {
    //   const fontStyle = box.styles['font-style'];
    //   const fontWeight = box.styles['font-weight'];
    //   const fontSize = box.styles['font-size'];
    //   const fontFamily = box.styles['font-family'];

    //   this.context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    //   this.context.fillStyle = box.styles.color;
    //   this.context.fillText(box.text, box.x, box.y);
    // });

    this.textBoxes.forEach((box) => {
      const fontStyle = box.styles['font-style'];
      const fontWeight = box.styles['font-weight'];
      const fontSize = box.styles['font-size'];
      const fontFamily = box.styles['font-family'];

      this.context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
      this.context.fillStyle = box.styles.color;
      this.context.fillText(box.text, box.x, box.y);

      // La funzione fillText del canvas non supporta direttamente lo stile di sottolineatura, quindi disegnamo la sottolineatura se attiva.
      if (box.styles['text-decoration'] === 'underline') {
        const textWidth = this.context.measureText(box.text).width;
        const fontSize = parseInt(box.styles['font-size'], 10);

        this.context.beginPath();
        this.context.moveTo(box.x, box.y + 2); // Inizia leggermente sotto il testo
        this.context.lineTo(box.x + textWidth, box.y + 2); // Fino alla larghezza del testo
        this.context.lineWidth = 3; // Imposta lo spessore della linea
        this.context.strokeStyle = box.styles.color; // Usa lo stesso colore del testo
        this.context.stroke();
      }
    });
  }

  addTextBox(text: string, styles: any) {
    this.textBoxes.push({
      id: this.nextId++,
      text,
      originalText: text,
      x: 50,
      y: 50,
      styles,
    });
    this.redrawImage();
  }

  updateTextBoxStyle(id: number, styles: any) {
    const box = this.textBoxes.find((b) => b.id === id);
    if (box) {
      box.styles = styles;
      this.redrawImage();
    }
  }

  updateTextBox(id: number, newText: string) {
    const box = this.textBoxes.find((b) => b.id === id);
    if (box) {
      box.text = newText;
      this.redrawImage();
    }
  }

  enableTextEdit(box: any) {
    // Nascondi il testo esistente
    this.context.clearRect(
      box.x,
      box.y - parseInt(box.styles['font-size']),
      this.context.measureText(box.text).width,
      parseInt(box.styles['font-size'])
    );

    const inputElement = document.createElement('input');

    // Calcola le coordinate del canvas rispetto alla pagina
    const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
    // Calcola le coordinate della casella di testo con il fattore di scala applicato
    const scaledX = canvasRect.left + box.x * this.zoomLevel;
    const scaledY = canvasRect.top + box.y * this.zoomLevel;

    inputElement.type = 'text';
    inputElement.value = box.text;
    inputElement.style.position = 'absolute';
    inputElement.style.left = `${scaledX}px`;
    inputElement.style.top = `${scaledY - parseInt(box.styles['font-size'])}px`;
    inputElement.style.fontSize = `${
      parseInt(box.styles['font-size']) * this.zoomLevel
    }px`;
    inputElement.style.fontFamily = box.styles['font-family'];
    inputElement.style.color = box.styles['color'];
    inputElement.style.border = 'none';
    inputElement.style.outline = 'none';
    inputElement.style.background = 'transparent';
    inputElement.style.zIndex = '1000';

    inputElement.onblur = () => {
      this.updateTextBox(box.id, inputElement.value);
      inputElement.remove();
    };

    inputElement.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.updateTextBox(box.id, inputElement.value);
        inputElement.remove();
      }
    };

    document.body.appendChild(inputElement);
    inputElement.focus();
  }

  onMouseDown(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const box = this.textBoxes.find((box) =>
      this.isInsideBox(offsetX, offsetY, box)
    );
    if (box) {
      this.selectedBoxId = box.id;
      this.dragOffsetX = offsetX - box.x;
      this.dragOffsetY = offsetY - box.y;

      // Inizia un timeout per distinguere tra clic veloce e drag-and-drop
      this.clickTimeout = setTimeout(() => {
        this.isDragging = true;
      }, 200);
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.selectedBoxId !== null) {
      const box = this.textBoxes.find((box) => box.id === this.selectedBoxId);
      if (box) {
        const { offsetX, offsetY } = event;
        box.x = offsetX - this.dragOffsetX;
        box.y = offsetY - this.dragOffsetY;
        this.redrawImage();
      }
    }
  }

  onMouseUp() {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    if (this.isDragging) {
      this.isDragging = false;
    } else if (this.selectedBoxId !== null) {
      // Se non è stato un drag, abilita la modifica del testo
      const box = this.textBoxes.find((box) => box.id === this.selectedBoxId);
      if (box) {
        this.enableTextEdit(box);
      }
    }

    this.isDragging = false;
  }

  isInsideBox(x: number, y: number, box: any): boolean {
    this.context.font = `${box.styles['font-size']} ${box.styles['font-family']}`;
    const metrics = this.context.measureText(box.text);
    return (
      x >= box.x &&
      x <= box.x + metrics.width &&
      y <= box.y &&
      y >= box.y - parseInt(box.styles['font-size'])
    );
  }

  saveImage() {
    const link = document.createElement('a');
    link.href = this.canvasRef.nativeElement.toDataURL('image/png');
    link.download = 'SafeDoc-image.png';
    link.click();
  }

  applyTransform(scale: number) {
    this.zoomLevel = scale;
    this.transformMatrix = new DOMMatrix();
    this.transformMatrix.scaleSelf(this.zoomLevel);
    this.redrawImage();
  }

  addWatermarkImage(watermarkCanvas: HTMLCanvasElement) {
    this.watermarkImage = new Image();
    this.watermarkImage.src = watermarkCanvas.toDataURL();
    this.watermarkImage.onload = () => {
      this.watermarkApplied = true;
      this.redrawImage();
    };
  }

  removeWatermarkImage() {
    this.watermarkImage = null;
    this.redrawImage();
  }
}
