import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Imports
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Other Libraries
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { QuillModule } from 'ngx-quill';

// Components
import { ProcessAuditsComponent } from './process-audits.component';
import { PauditsNewAuditComponent } from './paudits-new-audit/paudits-new-audit.component';
import { PauditsActiveAuditsComponent } from './paudits-active-audits/paudits-active-audits.component';
import { PauditsSetupComponent } from './paudits-setup/paudits-setup.component';
import { PauditsAlertsComponent } from './paudits-alerts/paudits-alerts.component';
import { PauditsCompletedAuditsComponent } from './paudits-completed-audits/paudits-completed-audits.component';
import { PauditsHelpDeskComponent } from './paudits-help-desk/paudits-help-desk.component';
import { PauditsUserManualComponent } from './paudits-user-manual/paudits-user-manual.component';
import { PauditsActionsComponent } from './paudits-actions/paudits-actions.component';
import { ActiveauditsReferenceComponent } from './paudits-active-audits/activeaudits-reference/activeaudits-reference.component';
import { PauditsAlertsDetailsComponent } from './paudits-alerts/paudits-alerts-details/paudits-alerts-details.component';
import { ProcessAuditsCategoriesComponent } from './paudits-setup/process-audits-categories/process-audits-categories.component';
import { AddProcessCategoryPopComponent } from './paudits-setup/process-audits-categories/add-process-category-pop/add-process-category-pop.component';
import { ActionDescRemarksComponent } from './paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsGridComponent } from './paudits-actions/process-actions-grid/process-actions-grid.component';
import { ProcessActionsEditComponent } from './paudits-actions/process-actions-edit/process-actions-edit.component';
import { ProcessDocPopComponent } from './paudits-actions/process-doc-pop/process-doc-pop.component';
import { AuditCategoriesInnerscreenComponent } from './paudits-setup/process-audits-categories/audit-categories-innerscreen/audit-categories-innerscreen.component';
import { AddQuestionPopComponent } from './paudits-setup/process-audits-categories/audit-categories-innerscreen/question-pop/question-pop.component';
import { ViewGuidelineComponent } from './paudits-setup/view-guideline/view-guideline.component';
import { AuditSummaryReportComponent } from './audit-summary-report/audit-summary-report.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessAuditsComponent,
    children: [
      { path: '', redirectTo: 'analytics', pathMatch: 'full' },
      {
        path: 'analytics',
        loadChildren: () => import('./paudits-analytics/paudits-analytics.module').then(m => m.PauditsAnalyticsModule),
        data: { breadcrumb: 'Analytics' }
      },
      { path: 'new-audit', component: PauditsNewAuditComponent, data: { breadcrumb: 'New Audit' } },
      { path: 'active-audits', component: PauditsActiveAuditsComponent, data: { breadcrumb: 'Active Audits' } },
      { path: 'reference', component: ActiveauditsReferenceComponent, data: { breadcrumb: 'Reference' } },
      { path: 'details', component: PauditsAlertsDetailsComponent, data: { breadcrumb: 'Alert Details' } },
      {
        path: 'setup',
        component: PauditsSetupComponent,
        data: { breadcrumb: 'Setup', description: 'Configure process audit setup and master data.' },
        children: [
          { path: '', redirectTo: 'process-cat', pathMatch: 'full' },
          {
            path: 'process-cat',
            data: { breadcrumb: 'Process Audit Categories', description: 'Configure process audit category master data.' },
            children: [
              { path: '', component: ProcessAuditsCategoriesComponent },
              { path: 'inner', component: AuditCategoriesInnerscreenComponent, data: { breadcrumb: 'Category Detail' } }
            ]
          },
          { path: 'process-cat-inner', component: AuditCategoriesInnerscreenComponent, data: { breadcrumb: 'Category Detail' } },
          {
            path: 'commodity',
            loadChildren: () => import('./paudits-setup/commodity-master/commodity-master.module').then(m => m.CommodityMasterModule),
            data: { breadcrumb: 'Commodity Master', description: 'Configure commodity master data and quarterly targets.' }
          },
        ]
      },
      { path: 'alerts', component: PauditsAlertsComponent, data: { breadcrumb: 'Alerts' } },
      { path: 'completed-audits', component: PauditsCompletedAuditsComponent, data: { breadcrumb: 'Completed Audits' } },
      { path: 'user-manual', component: PauditsUserManualComponent, data: { breadcrumb: 'User Manual' } },
      { path: 'help-desk', component: PauditsHelpDeskComponent, data: { breadcrumb: 'Help Desk' } },
      { path: 'actions', component: PauditsActionsComponent, data: { breadcrumb: 'CAPA' } },
      {
    path: 'audit-summary-report',
    component: AuditSummaryReportComponent
  }
    ]
  }
];

@NgModule({
  declarations: [
    PauditsActiveAuditsComponent,
    PauditsSetupComponent,
    PauditsAlertsComponent,
    PauditsCompletedAuditsComponent,
    PauditsUserManualComponent,
    PauditsHelpDeskComponent,
    PauditsActionsComponent,
    ActiveauditsReferenceComponent,
    PauditsAlertsDetailsComponent,
    ProcessAuditsCategoriesComponent,
    AddProcessCategoryPopComponent,
    PauditsNewAuditComponent,
    ActionDescRemarksComponent,
    ProcessActionsGridComponent,
    ProcessActionsEditComponent,
    ProcessDocPopComponent,
    AuditCategoriesInnerscreenComponent,
    AddQuestionPopComponent,
    ViewGuidelineComponent,
    AuditSummaryReportComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ProcessAuditsComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    CanvasJSAngularChartsModule,
    HighchartsChartModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    QuillModule.forRoot()
  ]
})
export class ProcessAuditsModule { }