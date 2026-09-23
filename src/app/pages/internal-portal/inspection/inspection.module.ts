// inspection.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// 1. Import Forms Modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

// Components
import { InspectionComponent } from './inspection.component';
import { InspectionAnalyticsComponent } from './inspection-analytics/inspection-analytics.component';
import { InspectionDatatableComponent } from './inspection-datatable/inspection-datatable.component';
import { AddRecordPopComponent } from './add-record-pop/add-record-pop.component';

// Material & Highcharts & NgxCharts
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';         
import { HighchartsChartModule } from 'highcharts-angular';
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DefectsPopComponent } from './inspection-datatable/defects-pop/defects-pop.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InspectionCapaComponent } from './inspection-capa/inspection-capa.component';
import { InspectionArchivesComponent } from './inspection-archives/inspection-archives.component';
import { MatPaginatorModule } from "@angular/material/paginator";
import { DefectsPopMasterComponent } from './inspection-datatable/defects-pop-master/defects-pop-master.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { InspectionDocspopComponent } from './inspection-capa/inspection-docspop/inspection-docspop.component';
import { CapaEditPopComponent } from './inspection-capa/capa-edit-pop/capa-edit-pop.component'; // <-- Already here, just needed in imports array below
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  {
    path: '',
    component: InspectionComponent,
    children: [
      { path: '', redirectTo: 'analytics', pathMatch: 'full' }, 
      { path: 'analytics', component: InspectionAnalyticsComponent, data: { breadcrumb: 'Analytics', description: 'Overview of incoming inspection metrics and quality trends.' } },
      { path: 'datatable', component: InspectionDatatableComponent, data: { breadcrumb: 'Active Records', description: 'Manage and track active incoming inspection records.' } },
      { path: 'inspectioncapa', component: InspectionCapaComponent, data: { breadcrumb: 'CAPA', description: 'Corrective and preventive actions for inspection defects.' } },
      { path: 'inspectionarchive', component: InspectionArchivesComponent, data: { breadcrumb: 'Archives', description: 'Archived inspection records and historical logs.' } }
    ]
  }
];

@NgModule({
  declarations: [
    InspectionAnalyticsComponent,
    InspectionDatatableComponent,
    AddRecordPopComponent,
    DefectsPopComponent,
    InspectionCapaComponent,
    InspectionArchivesComponent,
    DefectsPopMasterComponent,
    InspectionDocspopComponent,
    CapaEditPopComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InspectionComponent,
    FormsModule, 
    ReactiveFormsModule, 
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    HighchartsChartModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatPaginatorModule,
    NgxChartsModule, // ✅ ADDED HERE,
    MatTooltipModule,
    MatProgressSpinnerModule,
]
})
export class InspectionModule { }