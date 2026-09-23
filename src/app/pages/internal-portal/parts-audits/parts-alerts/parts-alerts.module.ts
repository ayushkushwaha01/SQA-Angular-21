import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// Angular Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Imports
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

// Component Imports
import { PartsAlertsComponent } from './parts-alerts.component';
import { PartsAlertsDetailsComponent } from './parts-alerts-details/parts-alerts-details.component';
import { MatCardModule } from "@angular/material/card";

const routes: Routes = [
  {
    path: '',
    component: PartsAlertsComponent
  },
  {
    path: 'details',
    component: PartsAlertsDetailsComponent
  }
];

@NgModule({
  declarations: [
    PartsAlertsComponent,
    PartsAlertsDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes), // Important: Add the routes here
    FormsModule,
    ReactiveFormsModule, // Required for your FormBuilder in the details component

    // ✅ ADDED HERE: Added MatCardModule to the Angular imports context


    MatCheckboxModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatCardModule
  ]
})
export class PartsAlertsModule { }