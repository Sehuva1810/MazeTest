import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazeDisplayComponent } from './maze-display.component';
import {LoggingService} from "../../../../logging/logging.service";
import {ValantDemoApiClient} from "../../../../api-client/api-client";


describe('MazeDisplayComponent', () => {
  let component: MazeDisplayComponent;
  let fixture: ComponentFixture<MazeDisplayComponent>;
  let loggerMock: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    loggerMock = {
      log: jest.fn(),
      error: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [MazeDisplayComponent],
      providers: [
        { provide: LoggingService, useValue: loggerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MazeDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('renderMaze', () => {
    it('should render maze with player position', () => {
      component.maze = {
        id: '1',
        name: 'Test Maze',
        grid: 'XXX\nXOX\nXXX'
      };

      component.gameState = {
        sessionId: 'test-session',
        mazeId: '1',
        currentPosition: { x: 1, y: 1 },
        availableMoves: [ValantDemoApiClient.Direction._0],
        isComplete: false
      };

      const rendered = component.renderMaze();
      const expectedDisplay = '███\n█@█\n███';

      expect(rendered).toBe(expectedDisplay);
    });
  });
});
