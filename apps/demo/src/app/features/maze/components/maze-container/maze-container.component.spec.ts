import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MazeContainerComponent } from './maze-container.component';
import { MazeService } from '../../../../core/services/maze.service';
import { LoggingService } from '../../../../logging/logging.service';
import { ValantDemoApiClient } from '../../../../api-client/api-client';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MazeContainerComponent', () => {
  let component: MazeContainerComponent;
  let fixture: ComponentFixture<MazeContainerComponent>;
  let mazeService: jest.Mocked<MazeService>;
  let logger: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    mazeService = {
      getMazes: jest.fn().mockReturnValue(of([])),
      getCurrentGame: jest.fn().mockReturnValue(of(null)),
      getLoading: jest.fn().mockReturnValue(of(false)),
      getError: jest.fn().mockReturnValue(of(null)),
      loadMazes: jest.fn().mockReturnValue(of(undefined)),
      initializeGame: jest.fn().mockReturnValue(of(undefined)),
      makeMove: jest.fn().mockReturnValue(of(undefined)),
      uploadMaze: jest.fn().mockReturnValue(of(undefined)),
      resetGame: jest.fn().mockReturnValue(of(undefined))
    } as any;

    logger = {
      log: jest.fn(),
      error: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [MazeContainerComponent],
      providers: [
        { provide: MazeService, useValue: mazeService },
        { provide: LoggingService, useValue: logger }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MazeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load mazes on init', () => {
    expect(mazeService.loadMazes).toHaveBeenCalled();
  });

  it('should handle successful file upload', fakeAsync(() => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    component.onFileSelected(file);
    tick();

    expect(mazeService.uploadMaze).toHaveBeenCalledWith(file);
    expect(logger.log).toHaveBeenCalledWith('Upload and reload completed successfully');
  }));

  it('should handle file upload error', fakeAsync(() => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    mazeService.uploadMaze.mockReturnValue(throwError(() => 'Upload error'));

    component.onFileSelected(file);
    tick();

    expect(logger.error).toHaveBeenCalled();
  }));

  it('should initialize maze', fakeAsync(() => {
    component.onMazeSelect('1');
    tick();

    expect(mazeService.initializeGame).toHaveBeenCalledWith('1');
  }));

  it('should make move', fakeAsync(() => {
    component.onMove(ValantDemoApiClient.Direction._0);
    tick();

    expect(mazeService.makeMove).toHaveBeenCalledWith(ValantDemoApiClient.Direction._0);
  }));


  it('should reset game', fakeAsync(() => {
    component.onReset();
    tick();

    expect(mazeService.resetGame).toHaveBeenCalled();
  }));

});
