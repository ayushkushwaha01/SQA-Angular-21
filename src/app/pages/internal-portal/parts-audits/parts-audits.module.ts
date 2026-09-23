import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HighchartsChartModule } from 'highcharts-angular';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';

import { PartsAuditsComponent } from './parts-audits.component';
import { PartsCompletedAuditsComponent } from './parts-completed-audits/parts-completed-audits.component';
import { PartsActionsComponent } from './parts-actions/parts-actions.component';
import { PartsUserManualComponent } from './parts-user-manual/parts-user-manual.component';
import { HelpDeskComponent } from './help-desk/help-desk.component';
import { NewAuditComponent } from './new-audit/new-audit.component';
import { ViewDocPhotosComponent } from './parts-actions/view-doc-photos/view-doc-photos.component';
import { PartsActionsGridComponent } from './parts-actions/parts-actions-grid/parts-actions-grid.component';
import { PartsActionsEditComponent } from './parts-actions/parts-actions-edit/parts-actions-edit.component';
import { PartsActionsDocsComponent } from './parts-actions/parts-actions-docs/parts-actions-docs.component';
import { MatCardModule } from "@angular/material/card";
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  {
    path: '',
    component: PartsAuditsComponent,
    children: [
      {
        path: 'analytics',
        loadChildren: () =>
          import('./parts-analytics/parts-analytics.module').then(
            m => m.PartsAnalyticsModule
          ),
        data: { breadcrumb: 'Analytics' }
      },
      {
        path: 'active-audits',
        loadChildren: () =>
          import('./parts-active-audits/parts-active-audits.module').then(
            m => m.PartsActiveAuditsModule
          ),
        data: { breadcrumb: 'Active Audits' }
      },
      {
        path: 'setup',
        loadChildren: () =>
          import('./parts-setup/parts-setup.module').then(
            m => m.PartsSetupModule
          ),
        data: { breadcrumb: 'Setup', description: 'Configure settings, categories, and master data.' }
      },
      {
        path: 'alerts',
        loadChildren: () =>
          import('./parts-alerts/parts-alerts.module').then(
            m => m.PartsAlertsModule
          ),
        data: { breadcrumb: 'Alerts' }
      },
      { path: 'new-audit', component: NewAuditComponent, data: { breadcrumb: 'New Audit' } },
      { path: 'completed-audits', component: PartsCompletedAuditsComponent, data: { breadcrumb: 'Completed Audits' } },
      { path: 'actions', component: PartsActionsComponent, data: { breadcrumb: 'CAPA' } },
      { path: 'user-manual', component: PartsUserManualComponent, data: { breadcrumb: 'User Manual' } },
      { path: 'help-desk', component: HelpDeskComponent, data: { breadcrumb: 'Help Desk' } },
      { path: '', redirectTo: 'analytics', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    PartsCompletedAuditsComponent,
    PartsActionsComponent,
    PartsUserManualComponent,
    HelpDeskComponent,
    NewAuditComponent,
    ViewDocPhotosComponent,
    PartsActionsGridComponent,
    PartsActionsEditComponent,
    PartsActionsDocsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PartsAuditsComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    HighchartsChartModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ]
})
export class PartsAuditsModule { }