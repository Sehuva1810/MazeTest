import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazeGridComponent } from './maze-grid.component';
import { LoggingService } from '../../../../logging/logging.service';

describe('MazeGridComponent', () => {
  let component: MazeGridComponent;
  let fixture: ComponentFixture<MazeGridComponent>;
  let loggerMock: jest.Mocked<LoggingService>;

  const mockMazes = [
    { id: '1', name: 'Maze 1', grid: 'XXX\nXOX\nXXX' },
    { id: '2', name: 'Maze 2', grid: 'XXXXX\nXOOOX\nXXXXX' }
  ];

  beforeEach(async () => {
    loggerMock = {
      log: jest.fn(),
      error: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [MazeGridComponent],
      providers: [
        { provide: LoggingService, useValue: loggerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MazeGridComponent);
    component = fixture.componentInstance;
    component.mazes = mockMazes;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('maze selection', () => {
    it('should emit selected maze id', () => {
      const mazeSelectedSpy = jest.spyOn(component.mazeSelected, 'emit');
      component.onMazeSelect('1');
      expect(mazeSelectedSpy).toHaveBeenCalledWith('1');
    });

    it('should not emit when loading', () => {
      const mazeSelectedSpy = jest.spyOn(component.mazeSelected, 'emit');
      component.loading = true;
      component.onMazeSelect('1');
      expect(mazeSelectedSpy).not.toHaveBeenCalled();
    });
  });
});