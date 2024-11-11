import { 
  Component, 
  Input, 
  OnInit, 
  ChangeDetectionStrategy 
} from '@angular/core';
import { ValantDemoApiClient } from "../../../../api-client/api-client";
import { LoggingService } from "../../../../logging/logging.service";

type GameState = ValantDemoApiClient.GameState;
type MazeDefinition = ValantDemoApiClient.MazeDefinition;
type Position = ValantDemoApiClient.Position;

@Component({
  selector: 'valant-app-maze-display',
  templateUrl: './maze-display.component.html',
  styleUrls: ['./maze-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MazeDisplayComponent implements OnInit {
  private static readonly CELL_SYMBOLS = {
    PLAYER: '@',
    START: 'S',
    END: 'E',
    WALL: '█',
    PATH: ' '
  } as const;

  private static readonly SYMBOL_MAP: Readonly<Record<string, string>> = {
    'S': MazeDisplayComponent.CELL_SYMBOLS.START,
    'E': MazeDisplayComponent.CELL_SYMBOLS.END,
    'X': MazeDisplayComponent.CELL_SYMBOLS.WALL,
    'O': MazeDisplayComponent.CELL_SYMBOLS.PATH
  };

  @Input() maze: MazeDefinition | null = null;
  @Input() gameState: GameState | null = null;

  constructor(private readonly logger: LoggingService) {}

  ngOnInit(): void {
    this.logger.log('MazeDisplay component initialized');
  }

  get currentPosition(): Position | null {
    return this.gameState?.currentPosition ?? null;
  }

  get isComplete(): boolean {
    return this.gameState?.isComplete ?? false;
  }

  renderMaze(): string {
    if (!this.maze?.grid || !this.currentPosition) {
      return '';
    }

    try {
      return this.generateMazeDisplay();
    } catch (error) {
      this.logger.error('Error rendering maze', error);
      return 'Error rendering maze';
    }
  }

  getAccessibleDescription(): string {
    if (!this.currentPosition) {
      return 'No active game';
    }

    const { x, y } = this.currentPosition;
    const position = `Current position: ${x}, ${y}`;
    const status = this.isComplete ? 'Maze completed!' : 'In progress';

    return `${position}. Game status: ${status}`;
  }

  private generateMazeDisplay(): string {
    const lines = this.maze!.grid.split('\n');
    const { x, y } = this.currentPosition!;

    return lines.map((line, lineY) =>
      line.split('').map((cell, cellX) => 
        this.getCellSymbol(cell, cellX === x && lineY === y)
      ).join('')
    ).join('\n');
  }

  private getCellSymbol(cell: string, isPlayerPosition: boolean): string {
    if (isPlayerPosition) {
      return MazeDisplayComponent.CELL_SYMBOLS.PLAYER;
    }
    return MazeDisplayComponent.SYMBOL_MAP[cell] ?? cell;
  }
}