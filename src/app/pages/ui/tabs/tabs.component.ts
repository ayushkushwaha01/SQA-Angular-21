import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-tabs',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatTabsModule,
        MatIconModule
    ],
    templateUrl: './tabs.component.html',
    styleUrl: './tabs.component.scss'
})
export class TabsComponent {

}
