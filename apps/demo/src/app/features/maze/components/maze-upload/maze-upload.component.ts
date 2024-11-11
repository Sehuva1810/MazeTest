import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy
  } from '@angular/core';
  import { LoggingService } from '../../../../logging/logging.service';

  
  interface FileValidationResult {
    isValid: boolean;
    error?: string;
  }
  
  type AcceptedMimeType = 'text/plain';
  
  @Component({
    selector: 'valant-app-maze-upload',
    templateUrl: './maze-upload.component.html',
    styleUrls: ['./maze-upload.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class MazeUploadComponent {
    private static readonly ACCEPTED_FILE_TYPES: readonly AcceptedMimeType[] = ['text/plain'];
    private static readonly ACCEPTED_EXTENSIONS = ['.txt'] as const;
    private static readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB
    private static readonly ERROR_MESSAGES = {
      INVALID_TYPE: 'Invalid file type. Please upload a text file.',
      FILE_TOO_LARGE: `File size exceeds ${MazeUploadComponent.MAX_FILE_SIZE / 1024 / 1024}MB limit.`
    } as const;
  
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @Input() loading = false;
    @Output() fileSelected = new EventEmitter<File>();
  
    isDragging = false;
    currentFile: File | null = null;
  
    constructor(private readonly logger: LoggingService) {}
  
    onDragOver(event: DragEvent): void {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = true;
    }
  
    onDragLeave(event: DragEvent): void {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
    }
  
    onDrop(event: DragEvent): void {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
  
      const files = event.dataTransfer?.files;
      if (files?.length) {
        this.handleFile(files[0]);
      }
    }
  
    onFileInputChange(event: Event): void {
      const files = (event.target as HTMLInputElement).files;
      if (files?.length) {
        this.handleFile(files[0]);
      }
      this.fileInput.nativeElement.value = '';
    }
  
    private handleFile(file: File): void {
      this.logger.log('File received', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
  
      const validationResult = this.validateFile(file);
      
      if (!validationResult.isValid) {
        this.logger.error('File validation failed', { 
          error: validationResult.error,
          fileName: file.name 
        });
        this.currentFile = null;
        return;
      }
  
      this.currentFile = file;
      this.fileSelected.emit(file);
    }
  
    private validateFile(file: File): FileValidationResult {
      if (!this.isValidFileType(file)) {
        return {
          isValid: false,
          error: MazeUploadComponent.ERROR_MESSAGES.INVALID_TYPE
        };
      }
  
      if (!this.isValidFileSize(file)) {
        return {
          isValid: false,
          error: MazeUploadComponent.ERROR_MESSAGES.FILE_TOO_LARGE
        };
      }
  
      return { isValid: true };
    }
  
    private isValidFileType(file: File): boolean {
      const hasValidMimeType = MazeUploadComponent.ACCEPTED_FILE_TYPES.includes(file.type as AcceptedMimeType);
      const hasValidExtension = MazeUploadComponent.ACCEPTED_EXTENSIONS.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
  
      return hasValidMimeType || hasValidExtension;
    }
  
    private isValidFileSize(file: File): boolean {
      return file.size <= MazeUploadComponent.MAX_FILE_SIZE;
    }
  
  }