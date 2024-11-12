import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MazeModule } from './features/maze/maze.module';
import { LoggingService } from './logging/logging.service';
import { API_CLIENT_PROVIDERS } from './core/services/api-client.provider';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MazeModule
  ],
  providers: [
    LoggingService,
    ...API_CLIENT_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }