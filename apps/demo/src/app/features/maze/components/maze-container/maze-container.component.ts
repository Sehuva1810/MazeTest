import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap, catchError } from 'rxjs/operators';
import { MazeService } from "../../../../core/services/maze.service";
import { ValantDemoApiClient } from "../../../../api-client/api-client";
import { LoggingService } from "../../../../logging/logging.service";

type GameState = ValantDemoApiClient.GameState;
type MazeDefinition = ValantDemoApiClient.MazeDefinition;
type Direction = ValantDemoApiClient.Direction;

@Component({
  selector: 'valant-app-maze-container',
  templateUrl: './maze-container.component.html',
  styleUrls: ['./maze-container.component.less']
})
export class MazeContainerComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly mazes$: Observable<MazeDefinition[]>;
  readonly currentGame$: Observable<GameState | null>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  constructor(
    private readonly mazeService: MazeService,
    private readonly logger: LoggingService
  ) {
    this.mazes$ = this.mazeService.getMazes().pipe(takeUntil(this.destroy$));
    this.currentGame$ = this.mazeService.getCurrentGame().pipe(takeUntil(this.destroy$));
    this.loading$ = this.mazeService.getLoading().pipe(takeUntil(this.destroy$));
    this.error$ = this.mazeService.getError().pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    this.loadMazes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(file: File): void {
    this.logger.log('File selected for upload', { fileName: file.name });
    
    this.mazeService.uploadMaze(file).pipe(
      switchMap(() => this.mazeService.loadMazes()),
      catchError(error => {
        this.logger.error('Upload process failed', error);
        throw error;
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => this.logger.log('Upload and reload completed successfully'),
      error: (error) => this.logger.error('Upload process failed', error)
    });
  }

  onMazeSelect(mazeId: string): void {
    this.loading$.pipe(
      switchMap(isLoading => {
        if (isLoading) {
          return [];
        }
        
        this.logger.log('Maze selected', { mazeId });
        return this.mazeService.initializeGame(mazeId);
      }),
      catchError(error => {
        this.logger.error('Game initialization failed', error);
        throw error;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onMove(direction: Direction): void {
    this.loading$.pipe(
      switchMap(isLoading => {
        if (isLoading) {
          return [];
        }
        
        this.logger.log('Move initiated', { direction });
        return this.mazeService.makeMove(direction);
      }),
      catchError(error => {
        this.logger.error('Move failed', error);
        throw error;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onReset(): void {
    this.mazeService.resetGame().pipe(
      catchError(error => {
        this.logger.error('Reset failed', error);
        throw error;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private loadMazes(): void {
    this.mazeService.loadMazes().pipe(
      catchError(error => {
        this.logger.error('Failed to load mazes', error);
        throw error;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}