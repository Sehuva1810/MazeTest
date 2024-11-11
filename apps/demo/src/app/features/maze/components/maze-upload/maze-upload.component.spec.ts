import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazeUploadComponent } from './maze-upload.component';
import { LoggingService } from '../../../../logging/logging.service';
import { ElementRef } from '@angular/core';

describe('MazeUploadComponent', () => {
  let component: MazeUploadComponent;
  let fixture: ComponentFixture<MazeUploadComponent>;
  let loggerMock: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    loggerMock = {
      log: jest.fn(),
      error: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [MazeUploadComponent],
      providers: [
        { provide: LoggingService, useValue: loggerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MazeUploadComponent);
    component = fixture.componentInstance;
    
    // Mock the fileInput ElementRef
    component.fileInput = {
      nativeElement: {
        value: ''
      }
    } as ElementRef<HTMLInputElement>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('file validation', () => {
    it('should accept valid text files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const fileSelectedSpy = jest.spyOn(component.fileSelected, 'emit');
      
      component.onFileInputChange({ target: { files: [file] } } as any);
      
      expect(fileSelectedSpy).toHaveBeenCalledWith(file);
      expect(component.fileInput.nativeElement.value).toBe('');
    });

    it('should reject invalid file types', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileSelectedSpy = jest.spyOn(component.fileSelected, 'emit');
      
      component.onFileInputChange({ target: { files: [file] } } as any);
      
      expect(fileSelectedSpy).not.toHaveBeenCalled();
      expect(loggerMock.error).toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    it('should handle dragover event', () => {
      const event = new Event('dragover') as DragEvent;
      event.preventDefault = jest.fn();
      event.stopPropagation = jest.fn();
      
      component.onDragOver(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBe(true);
    });

    it('should handle dragleave event', () => {
      const event = new Event('dragleave') as DragEvent;
      event.preventDefault = jest.fn();
      event.stopPropagation = jest.fn();
      
      component.onDragLeave(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBe(false);
    });
  });
});