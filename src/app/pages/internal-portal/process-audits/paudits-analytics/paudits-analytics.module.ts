import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HighchartsChartModule } from 'highcharts-angular';

import { PauditsAnalyticsComponent } from './paudits-analytics.component';
import { AnalyticsCommodityComponent } from './analytics-commodity/analytics-commodity.component';
import { AnalyticsPerformanceComponent } from './analytics-performance/analytics-performance.component';
import { AnalyticsActionsComponent } from './analytics-actions/analytics-actions.component';
import { AnalyticsScatterComponent } from './analytics-scatter/analytics-scatter.component';
import { AnalyticsBellcurveComponent } from './analytics-bellcurve/analytics-bellcurve.component';
import { AnalyticsParetoComponent } from './analytics-pareto/analytics-pareto.component';
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input'; //
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { AnalyticsSummaryComponent } from './analytics-summary/analytics-summary.component';
import { ProcessCastingComponent } from './analytics-commodity/process-casting/process-casting.component';
import { ProcessForgingComponent } from './analytics-commodity/process-forging/process-forging.component';
import { ProcessMachiningComponent } from './analytics-commodity/process-machining/process-machining.component';
import { ProcessFastenersComponent } from './analytics-commodity/process-fasteners/process-fasteners.component';
import { ProcessNonmetallicComponent } from './analytics-commodity/process-nonmetallic/process-nonmetallic.component';
import { ProcessSheetmetalComponent } from './analytics-commodity/process-sheetmetal/process-sheetmetal.component';
import { ProcessProprietaryComponent } from './analytics-commodity/process-proprietary/process-proprietary.component';


const routes: Routes = [
  {
    path: '',
    component: PauditsAnalyticsComponent,
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      {
        path: 'commodity',
        loadChildren: () => import('./analytics-commodity/analytics-commodity.module').then(m => m.AnalyticsCommodityModule),
        data: { breadcrumb: 'Commodity', description: 'Commodity wise process audit distribution.' }
      },
      { path: 'performance', component: AnalyticsPerformanceComponent, data: { breadcrumb: 'Performance', description: 'Performance metrics and trend analysis.' } },
      { path: 'actions', component: AnalyticsActionsComponent, data: { breadcrumb: 'Actions', description: 'Corrective and preventive action status tracking.' } },
      { path: 'scatter', component: AnalyticsScatterComponent, data: { breadcrumb: 'Scatter Plot', description: 'Process capability and risk scatter plot.' } },
      { path: 'bell-curve', component: AnalyticsBellcurveComponent, data: { breadcrumb: 'Bell Curve', description: 'Distribution bell curve representation.' } },
      { path: 'pareto', component: AnalyticsParetoComponent, data: { breadcrumb: 'Pareto Chart', description: 'Defect distribution pareto analysis.' } },
      { path: 'summary', component: AnalyticsSummaryComponent, data: { breadcrumb: 'Summary', description: 'This screen provides a comprehensive overview of process audit analytics and key performance indicators.' } }
    ]
  }
];

@NgModule({
  declarations: [
    PauditsAnalyticsComponent,
    // AnalyticsCommodityComponent,
    AnalyticsPerformanceComponent,
    AnalyticsActionsComponent,
    AnalyticsScatterComponent,
    AnalyticsBellcurveComponent,
    AnalyticsParetoComponent,
    AnalyticsSummaryComponent,
    // ProcessCastingComponent,
    // ProcessForgingComponent,
    // ProcessMachiningComponent,
    // ProcessFastenersComponent,
    // ProcessNonmetallicComponent,
    // ProcessSheetmetalComponent,
    // ProcessProprietaryComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HighchartsChartModule,
    MatIconModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    CanvasJSAngularChartsModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PauditsAnalyticsModule { }