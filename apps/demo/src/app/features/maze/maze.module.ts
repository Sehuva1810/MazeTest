import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MazeContainerComponent } from './components/maze-container/maze-container.component';
import { MazeGridComponent } from './components/maze-grid/maze-grid.component';
import { MazeControlsComponent } from './components/maze-controls/maze-controls.component';
import { MazeDisplayComponent } from './components/maze-display/maze-display.component';
import { MazeUploadComponent } from './components/maze-upload/maze-upload.component';
import { MazeByIdPipe } from './pipes/maze-by-id.pipe';
import {MazeService} from "../../core/services/maze.service";


@NgModule({
  declarations: [
    MazeContainerComponent,
    MazeGridComponent,
    MazeUploadComponent,
    MazeDisplayComponent,
    MazeControlsComponent,
    MazeByIdPipe
  ],
  imports: [
    CommonModule
  ],
  providers: [
    MazeService
  ],
  exports: [
    MazeContainerComponent
  ]
})
export class MazeModule { }
