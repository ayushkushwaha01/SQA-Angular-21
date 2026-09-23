import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';

// ✅ ADDED: Import CanvasJS for your Bell Curve chart
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// Component Imports
import { PartsAnalyticsComponent } from './parts-analytics.component';
import { PartsCommodityComponent } from './parts-commodity/parts-commodity.component';
import { PartsPerformanceComponent } from './parts-performance/parts-performance.component';
import { PartsScatterComponent } from './parts-scatter/parts-scatter.component';
import { PartsBellcurveComponent } from './parts-bellcurve/parts-bellcurve.component';
import { PartsParetoComponent } from './parts-pareto/parts-pareto.component';
import { PartsInnerActionsComponent } from './parts-inner-actions/parts-inner-actions.component';
import { PartsSummaryComponent } from './parts-summary/parts-summary.component';
import { FlexLayoutModule } from "@ngbracket/ngx-layout";
import { PartsAllComponent } from './parts-commodity/parts-all/parts-all.component';
import { PartsCastingComponent } from './parts-commodity/parts-casting/parts-casting.component';
import { PartsForgingComponent } from './parts-commodity/parts-forging/parts-forging.component';
import { PartsMarchiningComponent } from './parts-commodity/parts-marchining/parts-marchining.component';
import { PartsFastenersComponent } from './parts-commodity/parts-fasteners/parts-fasteners.component';
import { PartsNonmetalicComponent } from './parts-commodity/parts-nonmetalic/parts-nonmetalic.component';
import { PartsSheetmetalComponent } from './parts-commodity/parts-sheetmetal/parts-sheetmetal.component';


const routes: Routes = [
  {
    path: '',
    component: PartsAnalyticsComponent,
    children: [
      { path: 'commodity', loadChildren: () => import('./parts-commodity/parts-commodity.module').then(m => m.PartsCommodityModule) },
      { path: 'performance', component: PartsPerformanceComponent },
      { path: 'analyticsactions', component: PartsInnerActionsComponent },
      { path: 'scatter', component: PartsScatterComponent },
      { path: 'bell-curve', component: PartsBellcurveComponent },
      { path: 'pareto', component: PartsParetoComponent },
      { path: 'summary', component: PartsSummaryComponent },

      { path: '', redirectTo: 'summary', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    PartsAnalyticsComponent,
    PartsCommodityComponent,
    PartsPerformanceComponent,
    PartsScatterComponent,
    PartsBellcurveComponent,
    PartsParetoComponent,
    PartsInnerActionsComponent,
    PartsSummaryComponent,
    PartsForgingComponent,
    // PartsMarchiningComponent,
    PartsFastenersComponent,
    // PartsNonmetalicComponent,
    // PartsSheetmetalComponent,
    // PartsAllComponent,
    // PartsCastingComponent,

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    HighchartsChartModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    // ✅ ADDED: Add it to the imports array here
    CanvasJSAngularChartsModule,
    FlexLayoutModule
  ]
})
export class PartsAnalyticsModule { }