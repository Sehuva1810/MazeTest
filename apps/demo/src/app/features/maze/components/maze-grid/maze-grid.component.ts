import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  ChangeDetectionStrategy 
} from '@angular/core';
import { ValantDemoApiClient } from "../../../../api-client/api-client";
import { LoggingService } from "../../../../logging/logging.service";

type MazeDefinition = ValantDemoApiClient.MazeDefinition;

@Component({
  selector: 'valant-app-maze-grid',
  templateUrl: './maze-grid.component.html',
  styleUrls: ['./maze-grid.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MazeGridComponent implements OnInit {
  private static readonly PREVIEW_LINES = 5;

  @Input() mazes: ReadonlyArray<MazeDefinition> = [];
  @Input() selectedMazeId: string | null = null;
  @Input() loading = false;
  @Output() mazeSelected = new EventEmitter<string>();

  constructor(private readonly logger: LoggingService) {}

  ngOnInit(): void {
    this.logger.log('MazeGrid initialized', { mazeCount: this.mazes.length });
  }

  trackByMazeId(_: number, maze: MazeDefinition): string {
    return maze.id ?? '';
  }

  getPreview(grid: string): string {
    try {
      return grid
        .split('\n')
        .slice(0, MazeGridComponent.PREVIEW_LINES)
        .join('\n');
    } catch (error) {
      this.logger.error('Error generating preview', error);
      return 'Error generating preview';
    }
  }

  onMazeSelect(mazeId: string): void {
    if (this.canSelectMaze(mazeId)) {
      this.logger.log('Maze selected', { mazeId });
      this.mazeSelected.emit(mazeId);
    }
  }

  getMazeStatus(mazeId: string): string {
    return this.selectedMazeId === mazeId ? 'Selected' : 'Start Game';
  }

  private canSelectMaze(mazeId: string): boolean {
    return !this.loading && this.selectedMazeId !== mazeId;
  }
}