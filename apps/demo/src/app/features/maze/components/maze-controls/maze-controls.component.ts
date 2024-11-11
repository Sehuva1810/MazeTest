import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { ValantDemoApiClient } from '../../../../api-client/api-client';
import { LoggingService } from '../../../../logging/logging.service';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

interface ControlButton {
  readonly direction: ValantDemoApiClient.Direction;
  readonly symbol: string;
  readonly label: string;
  readonly keyCode: string;
}

@Component({
  selector: 'valant-app-maze-controls',
  templateUrl: './maze-controls.component.html',
  styleUrls: ['./maze-controls.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MazeControlsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @Input() availableMoves: ReadonlyArray<ValantDemoApiClient.Direction> = [];
  @Input() loading = false;
  @Output() moveSelected = new EventEmitter<ValantDemoApiClient.Direction>();

  readonly controls: ReadonlyArray<ControlButton> = [
    {
      direction: ValantDemoApiClient.Direction._0,
      symbol: '↑',
      label: 'Move Up',
      keyCode: 'ArrowUp'
    },
    {
      direction: ValantDemoApiClient.Direction._1,
      symbol: '→',
      label: 'Move Right',
      keyCode: 'ArrowRight'
    },
    {
      direction: ValantDemoApiClient.Direction._2,
      symbol: '↓',
      label: 'Move Down',
      keyCode: 'ArrowDown'
    },
    {
      direction: ValantDemoApiClient.Direction._3,
      symbol: '←',
      label: 'Move Left',
      keyCode: 'ArrowLeft'
    }
  ];

  constructor(private readonly logger: LoggingService) {}

  ngOnInit(): void {
    this.setupKeyboardControls();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupKeyboardControls(): void {
    fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      filter(event => {
        const control = this.controls.find(c => c.keyCode === event.key);
        return !!control && !this.isDisabled(control.direction);
      }),
      takeUntil(this.destroy$)
    ).subscribe(event => {
      const control = this.controls.find(c => c.keyCode === event.key);
      if (control) {
        event.preventDefault();
        this.onMove(control.direction);
      }
    });
  }

  isDisabled(direction: ValantDemoApiClient.Direction): boolean {
    return this.loading || !this.availableMoves.includes(direction);
  }

  onMove(direction: ValantDemoApiClient.Direction): void {
    if (!this.isDisabled(direction)) {
      this.logger.log('Move triggered', { direction });
      this.moveSelected.emit(direction);
    }
  }

  getAvailableMovesText(): string {
    if (!this.availableMoves.length) {
      return 'No moves available';
    }

    const availableDirections = this.controls
      .filter(c => this.availableMoves.includes(c.direction))
      .map(c => c.label);

    return `Available moves: ${availableDirections.join(', ')}`;
  }
}