import { Component, OnInit } from '@angular/core';
import { LoggingService } from './logging/logging.service';

@Component({
    selector: 'valant-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    public title = 'Maze demo';
    public data: string[];

    constructor(private logger: LoggingService) {}

    ngOnInit() {
        this.logger.log('Welcome to the AppComponent');
    }

}
