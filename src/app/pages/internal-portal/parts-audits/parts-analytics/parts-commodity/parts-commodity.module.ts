import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { PartsCommodityRoutingModule } from './parts-commodity-routing.module';

import { PartsCommodityComponent } from './parts-commodity.component';
import { PartsAllComponent } from './parts-all/parts-all.component';
import { PartsCastingComponent } from './parts-casting/parts-casting.component';
import { PartsForgingComponent } from './parts-forging/parts-forging.component';
import { PartsMarchiningComponent } from './parts-marchining/parts-marchining.component';
import { PartsFastenersComponent } from './parts-fasteners/parts-fasteners.component';
import { PartsNonmetalicComponent } from './parts-nonmetalic/parts-nonmetalic.component';
import { PartsSheetmetalComponent } from './parts-sheetmetal/parts-sheetmetal.component';
import { PartsProprietaryComponent } from './parts-proprietary/parts-proprietary.component';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PartsCommodityRoutingModule,
    MatButtonModule,
    MatSelectModule,    
    MatIconModule,      
    HighchartsChartModule
  ],
  declarations: [
    // PartsCommodityComponent,
    PartsAllComponent,
    PartsCastingComponent,
    // PartsForgingComponent,
    PartsMarchiningComponent,
    // PartsFastenersComponent,
    PartsNonmetalicComponent,
    PartsSheetmetalComponent,
    PartsProprietaryComponent
  ],
})
export class PartsCommodityModule { }