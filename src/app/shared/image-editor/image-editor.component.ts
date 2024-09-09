import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.css'],
})
export class ImageEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('imageCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('textEditorContainer', { static: false })
  textEditorContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('textEditor', { static: false })
  textEditorRef!: ElementRef<HTMLInputElement>;
  @ViewChild('deleteText', { static: false })
  deleteTextRef!: ElementRef<HTMLButtonElement>;

  private context!: CanvasRenderingContext2D;
  imageSrc: string = '';
  private originalImage: HTMLImageElement = new Image();
  private watermarkImage: HTMLImageElement | null = null;
  textBoxes: {
    id: number;
    textLines: string[];
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

    // Gestisce la "X" per eliminare il testo
    this.deleteTextRef.nativeElement.addEventListener('click', (event) => {
      event.stopPropagation();
      if (this.selectedBoxId !== null) {
        this.deleteTextBox(this.selectedBoxId);
      }
    });
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
    this.textBoxes.forEach((box) => {
      const fontStyle = box.styles['font-style'];
      const fontWeight = box.styles['font-weight'];
      const fontSize = box.styles['font-size'];
      const fontFamily = box.styles['font-family'];

      this.context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
      this.context.fillStyle = box.styles.color;

      // Disegna ogni riga del testo
      box.textLines.forEach((line, index) => {
        this.context.fillText(
          line,
          box.x,
          box.y + index * parseInt(fontSize, 10)
        );
      });

      // La funzione fillText del canvas non supporta direttamente lo stile di sottolineatura, quindi disegnamo la sottolineatura se attiva.
      if (box.styles['text-decoration'] === 'underline') {
        box.textLines.forEach((line, index) => {
          const textWidth = this.context.measureText(line).width;
          const lineY = box.y + index * parseInt(fontSize, 10) + 2;
          this.context.beginPath();
          this.context.moveTo(box.x, lineY);
          this.context.lineTo(box.x + textWidth, lineY);
          this.context.lineWidth = 3;
          this.context.strokeStyle = box.styles.color;
          this.context.stroke();
        });
      }
    });
  }

  addTextBox(text: string, styles: any) {
    const lines = text.split('\n'); // Divide il testo in righe
    this.textBoxes.push({
      id: this.nextId++,
      textLines: lines,
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
      box.textLines = newText.split('\n');
      box.originalText = newText;
      this.redrawImage();
    }
  }

  enableTextEdit(box: any) {
    const textareaElement = this.textEditorRef.nativeElement;
    const editorContainer = this.textEditorContainerRef.nativeElement;

    textareaElement.value = box.textLines.join('\n'); // Imposta il valore del textarea

    // Calcola le coordinate del canvas rispetto alla pagina
    const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();

    // Calcola la dimensione e la posizione del rettangolo che occupa il testo
    this.context.font = `${box.styles['font-style']} ${box.styles['font-weight']} ${box.styles['font-size']} ${box.styles['font-family']}`;
    const textWidth = this.context.measureText(box.textLines[0]).width;
    const textHeight = parseInt(box.styles['font-size'], 10) * 2;

    // Calcola la posizione dell'input sopra il testo
    const leftPosition = box.x + canvasRect.left - textWidth - window.scrollX;
    const topPosition = box.y + canvasRect.top - textHeight + window.scrollY;

    editorContainer.style.left = `${leftPosition}px`;
    editorContainer.style.top = `${topPosition}px`;

    editorContainer.hidden = false;
    textareaElement.focus();

    textareaElement.onblur = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget !== this.deleteTextRef.nativeElement) {
        this.updateTextBox(box.id, textareaElement.value);
        this.hideTextEditor();
      }
    };
  }

  deleteTextBox(id: number) {
    this.textBoxes = this.textBoxes.filter((box) => box.id !== id);
    this.redrawImage();
    this.hideTextEditor();
  }

  hideTextEditor() {
    this.textEditorContainerRef.nativeElement.hidden = true;
    this.selectedBoxId = null;
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
    } else {
      this.onMouseUp();
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
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx && this.originalImage) {
      // Calcola le nuove dimensioni dell'immagine
      const newWidth = this.originalImage.width * this.zoomLevel;
      const newHeight = this.originalImage.height * this.zoomLevel;

      // Aggiorna le dimensioni del canvas per adattarsi alla nuova scala
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Calcola la posizione per centrare l'immagine nel canvas
      const offsetX = (newWidth - canvas.width) / 2;
      const offsetY = (newHeight - canvas.height) / 2;

      // Cancella il canvas prima di ridisegnare
      ctx.clearRect(0, 0, newWidth, newHeight);

      // Applica la trasformazione per lo zoom e centra l'immagine
      ctx.setTransform(this.zoomLevel, 0, 0, this.zoomLevel, offsetX, offsetY);
      ctx.drawImage(
        this.originalImage,
        0,
        0,
        this.originalImage.width,
        this.originalImage.height
      );
    } else {
      console.error(
        "Impossibile ottenere il contesto del canvas o l'immagine non è stata caricata correttamente"
      );
    }
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
