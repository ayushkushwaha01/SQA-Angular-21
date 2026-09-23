import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HighchartsChartModule } from 'highcharts-angular';

import { SupplierProcessauditsComponent } from './supplier-processaudits.component';
import { SupProactivegridComponent } from './sup-proactivegrid/sup-proactivegrid.component';
import { SupProcapaComponent } from './sup-procapa/sup-procapa.component';

const routes: Routes = [
  {
    path: '',
    component: SupplierProcessauditsComponent,
    children: [
      { path: '', redirectTo: 'active-audits', pathMatch: 'full' },
      { path: 'active-audits', component: SupProactivegridComponent, data: { breadcrumb: 'Active Audits' } },
      { path: 'actions', component: SupProcapaComponent, data: { breadcrumb: 'CAPA' } }
    ]
  }
];

@NgModule({
  declarations: [
    SupplierProcessauditsComponent,
    SupProactivegridComponent,
    SupProcapaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCardModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    HighchartsChartModule
  ]
})
export class SupplierProcessauditsModule { }
