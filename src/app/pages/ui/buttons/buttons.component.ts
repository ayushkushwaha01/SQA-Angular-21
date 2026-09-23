import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-buttons',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule
    ],
    templateUrl: './buttons.component.html'
})
export class ButtonsComponent {

}
