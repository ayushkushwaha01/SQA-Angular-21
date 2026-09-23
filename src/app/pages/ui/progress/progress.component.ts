import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-progress',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatProgressBarModule
    ],
    templateUrl: './progress.component.html',
    styleUrl: './progress.component.scss'
})
export class ProgressComponent {

}
