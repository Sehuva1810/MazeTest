import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError, of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ValantDemoApiClient } from '../../api-client/api-client';
import { LoggingService } from '../../logging/logging.service';

type GameState = ValantDemoApiClient.GameState;
type MazeDefinition = ValantDemoApiClient.MazeDefinition;
type Direction = ValantDemoApiClient.Direction;

@Injectable({
  providedIn: 'root'
})
export class MazeService {
  private static readonly DEBOUNCE_TIME = 50;
  private static readonly ERROR_MESSAGES = {
    OPERATION_IN_PROGRESS: 'Operation in progress',
    NO_ACTIVE_SESSION: 'No active game session',
    INVALID_MOVE: 'Invalid move. Try another direction.',
    INITIALIZATION_FAILED: 'Failed to start maze. Please try again.'
  } as const;

  private readonly mazes$ = new BehaviorSubject<MazeDefinition[]>([]);
  private readonly currentGame$ = new BehaviorSubject<GameState | null>(null);
  private readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly error$ = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly apiClient: ValantDemoApiClient.Client,
    private readonly logger: LoggingService
  ) {
    this.logger.log('MazeService initialized');
  }

  public getMazes(): Observable<MazeDefinition[]> {
    return this.mazes$.asObservable().pipe(distinctUntilChanged());
  }

  public getCurrentGame(): Observable<GameState | null> {
    return this.currentGame$.asObservable().pipe(distinctUntilChanged());
  }

  public getLoading(): Observable<boolean> {
    return this.loading$.asObservable().pipe(
      debounceTime(MazeService.DEBOUNCE_TIME),
      distinctUntilChanged()
    );
  }

  public getError(): Observable<string | null> {
    return this.error$.asObservable().pipe(distinctUntilChanged());
  }

  public loadMazes(): Observable<void> {
    return this.executeApiCall(
      this.apiClient.available().pipe(
        tap(mazes => {
          this.logger.log('Mazes loaded successfully', { count: mazes.length });
          this.mazes$.next(mazes);
        })
      ),
      'Failed to load mazes',
      'Error loading mazes'
    );
  }

  public uploadMaze(file: File): Observable<void> {
    const fileParam: ValantDemoApiClient.FileParameter = { 
      data: file, 
      fileName: file.name 
    };

    return new Observable(subscriber => {
      if (this.loading$.value) {
        subscriber.error(new Error(MazeService.ERROR_MESSAGES.OPERATION_IN_PROGRESS));
        return;
      }

      this.setLoadingState(true);
      this.clearError();

      this.apiClient.upload(fileParam).pipe(
        tap(() => this.logger.log('Maze upload successful')),
        switchMap(() => this.apiClient.available()),
        tap(mazes => {
          this.logger.log('Mazes reloaded after upload', { count: mazes.length });
          this.mazes$.next(mazes);
        }),
        catchError(error => {
          this.handleError(error, 'Failed to upload maze', 'Error uploading maze');
          return throwError(() => error);
        }),
        finalize(() => {
          this.setLoadingState(false);
        }),
        map(() => void 0)
      ).subscribe({
        next: () => {
          subscriber.next();
          subscriber.complete();
        },
        error: (error) => {
          subscriber.error(error);
        }
      });
    });
  }

  public initializeGame(mazeId: string): Observable<void> {
    return this.executeApiCall(
      this.apiClient.initialize(mazeId).pipe(
        tap(gameState => {
          this.logger.log('Game initialized', { gameState });
          this.currentGame$.next(gameState);
        })
      ),
      MazeService.ERROR_MESSAGES.INITIALIZATION_FAILED,
      'Error initializing game'
    );
  }

  public makeMove(direction: Direction): Observable<void> {
    const currentGame = this.currentGame$.value;
    if (!currentGame?.sessionId) {
      return throwError(() => new Error(MazeService.ERROR_MESSAGES.NO_ACTIVE_SESSION));
    }

    return this.executeApiCall(
      this.apiClient.move(currentGame.sessionId, direction).pipe(
        tap(newGameState => {
          this.logger.log('Move successful', {
            newPosition: newGameState.currentPosition,
            isComplete: newGameState.isComplete
          });
          this.currentGame$.next(newGameState);
        })
      ),
      MazeService.ERROR_MESSAGES.INVALID_MOVE,
      'Error making move'
    );
  }

  public resetGame(): Observable<void> {
    this.logger.log('Resetting game state');
    this.currentGame$.next(null);
    this.error$.next(null);
    return from(Promise.resolve());
  }

  private executeApiCall<T>(
    apiCall: Observable<T>,
    userErrorMessage: string,
    logErrorMessage: string
  ): Observable<void> {
    return new Observable(subscriber => {
      if (this.loading$.value) {
        subscriber.error(new Error(MazeService.ERROR_MESSAGES.OPERATION_IN_PROGRESS));
        return;
      }

      this.setLoadingState(true);
      this.clearError();

      apiCall.pipe(
        catchError(error => {
          this.handleError(error, userErrorMessage, logErrorMessage);
          return throwError(() => error);
        }),
        finalize(() => {
          this.setLoadingState(false);
        }),
        map(() => void 0)
      ).subscribe({
        next: () => {
          subscriber.next();
          subscriber.complete();
        },
        error: (error) => {
          subscriber.error(error);
        }
      });
    });
  }

  private setLoadingState(isLoading: boolean): void {
    this.loading$.next(isLoading);
  }

  private clearError(): void {
    this.error$.next(null);
  }

  private handleError(error: unknown, userMessage: string, logMessage: string): void {
    this.logger.error(logMessage, error);
    this.error$.next(userMessage);
  }
}