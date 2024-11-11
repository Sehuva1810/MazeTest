import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MazeControlsComponent } from './maze-controls.component';
import { LoggingService } from '../../../../logging/logging.service';
import { ValantDemoApiClient } from 'src/app/api-client/api-client';

describe('MazeControlsComponent', () => {
  let component: MazeControlsComponent;
  let fixture: ComponentFixture<MazeControlsComponent>;
  let loggerMock: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    loggerMock = {
      log: jest.fn(),
      error: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [MazeControlsComponent],
      providers: [
        { provide: LoggingService, useValue: loggerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MazeControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('keyboard controls', () => {
    it('should handle arrow key presses', fakeAsync(() => {
      const moveSelectedSpy = jest.spyOn(component.moveSelected, 'emit');
      component.availableMoves = [ValantDemoApiClient.Direction._0];
      
      component.ngOnInit();
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(event);
      tick();

      expect(moveSelectedSpy).toHaveBeenCalledWith(ValantDemoApiClient.Direction._0);
    }));
  });
});