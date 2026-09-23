import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-tooltip',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTooltipModule,
        FormsModule
    ],
    templateUrl: './tooltip.component.html'
})
export class TooltipComponent {
  public position: TooltipPosition = 'before';
}
