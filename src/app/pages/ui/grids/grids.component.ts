import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-grids',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatGridListModule
    ],
    templateUrl: './grids.component.html'
})
export class GridsComponent {
  tiles = [
    { text: 'One', cols: 3, rows: 1, color: 'lightblue' },
    { text: 'Two', cols: 1, rows: 2, color: 'lightgreen' },
    { text: 'Three', cols: 1, rows: 1, color: 'lightpink' },
    { text: 'Four', cols: 2, rows: 1, color: '#DDBDF1' }
  ];
}
