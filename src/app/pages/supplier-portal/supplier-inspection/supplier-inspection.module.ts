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

import { SupplierInspectionComponent } from './supplier-inspection.component';
import { SupplierActiverecordsComponent } from './supplier-activerecords/supplier-activerecords.component';
import { SupplierCapaComponent } from './supplier-capa/supplier-capa.component';

const routes: Routes = [
  {
    path: '',
    component: SupplierInspectionComponent,
    children: [
      { path: '', redirectTo: 'active-records', pathMatch: 'full' },
      { path: 'active-records', component: SupplierActiverecordsComponent, data: { breadcrumb: 'Active Records' } },
      { path: 'capa', component: SupplierCapaComponent, data: { breadcrumb: 'CAPA' } }
    ]
  }
];

@NgModule({
  declarations: [
    SupplierInspectionComponent,
    SupplierActiverecordsComponent,
    SupplierCapaComponent
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
    MatTooltipModule
  ]
})
export class SupplierInspectionModule { }
