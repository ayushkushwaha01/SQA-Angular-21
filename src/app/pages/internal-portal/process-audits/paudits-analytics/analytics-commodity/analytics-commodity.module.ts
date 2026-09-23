import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material & Chart Imports 
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HighchartsChartModule } from 'highcharts-angular';

// Components
import { AnalyticsCommodityComponent } from './analytics-commodity.component';
import { ProcessCastingComponent } from './process-casting/process-casting.component';
import { ProcessForgingComponent } from './process-forging/process-forging.component';
import { ProcessMachiningComponent } from './process-machining/process-machining.component';
import { ProcessFastenersComponent } from './process-fasteners/process-fasteners.component';
import { ProcessNonmetallicComponent } from './process-nonmetallic/process-nonmetallic.component';
import { ProcessSheetmetalComponent } from './process-sheetmetal/process-sheetmetal.component';
import { ProcessProprietaryComponent } from './process-proprietary/process-proprietary.component';
import { ProcessAllComponent } from './process-all/process-all.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsCommodityComponent,
    children: [
      // DEFAULT ROUTE REDIRECT: When hitting the base URL, redirect to 'processall'
      { path: '', redirectTo: 'processall', pathMatch: 'full' }, 
      
      { path: 'processall', component: ProcessAllComponent },
      { path: 'casting', component: ProcessCastingComponent },
      { path: 'forging', component: ProcessForgingComponent },
      { path: 'machining', component: ProcessMachiningComponent },
      { path: 'fasteners', component: ProcessFastenersComponent },
      { path: 'non-metallic', component: ProcessNonmetallicComponent },
      { path: 'sheet-metal', component: ProcessSheetmetalComponent },
      { path: 'proprietary', component: ProcessProprietaryComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AnalyticsCommodityComponent,
    ProcessCastingComponent,
    ProcessForgingComponent,
    ProcessMachiningComponent,
    ProcessFastenersComponent,
    ProcessNonmetallicComponent,
    ProcessSheetmetalComponent,
    ProcessProprietaryComponent,
    ProcessAllComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    HighchartsChartModule
  ]
})
export class AnalyticsCommodityModule { }