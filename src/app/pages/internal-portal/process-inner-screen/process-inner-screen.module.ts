import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// --- ADDED FORMS MODULES (Required for formControlName and ngModel) ---
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// --- ANGULAR MATERIAL IMPORTS ---
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';   // <-- FIXES THE BUTTONS
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- FIXES TOOLTIPS ON ICONS
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

// Import your components
import { ProcessAuditDetailsComponent } from './process-audit-details/process-audit-details.component';
import { ProcessInnerScreenComponent } from './process-inner-screen.component';
import { ProcessAuditReferenceComponent } from './process-audit-reference/process-audit-reference.component';
import { ProcessCompletedReferenceComponent } from './process-completed-reference/process-completed-reference.component';
import { ProcessDocUploadPopComponent } from './process-doc-upload-pop/process-doc-upload-pop.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessInnerScreenComponent,
    children: [
      { path: 'process-audit-details', component: ProcessAuditDetailsComponent, data: { breadcrumb: 'Details' } },
      { path: 'process-audit-reference', component: ProcessAuditReferenceComponent, data: { breadcrumb: 'Audit Reference' } },
      { path: 'process-completed-reference', component: ProcessCompletedReferenceComponent, data: { breadcrumb: 'Completed Reference' } },
      { path: '', redirectTo: 'process-audit-details', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ProcessInnerScreenComponent,

    // --- ADD THE MISSING MODULES HERE ---
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatPaginatorModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatRadioModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [RouterModule],
  declarations: [
    ProcessAuditDetailsComponent,
    ProcessAuditReferenceComponent,
    ProcessCompletedReferenceComponent,
    ProcessDocUploadPopComponent
  ]
})
export class ProcessInnerScreen { }