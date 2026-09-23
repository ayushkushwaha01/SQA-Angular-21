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

import { SupplierPartsauditsComponent } from './supplier-partsaudits.component';
import { SupPartsActiveComponent } from './sup-parts-active/sup-parts-active.component';
import { SupPartsCapaComponent } from './sup-parts-capa/sup-parts-capa.component';
import { SupplierPartsRefComponent } from '../supplier-innerscreen/supplier-parts-ref/supplier-parts-ref.component';

const routes: Routes = [
  {
    path: '',
    component: SupplierPartsauditsComponent,
    children: [
      { path: '', redirectTo: 'parts-dashboard', pathMatch: 'full' },
      { path: 'parts-dashboard', component: SupPartsActiveComponent, data: { breadcrumb: 'Active Audits' } },
      { path: 'parts-actions', component: SupPartsCapaComponent, data: { breadcrumb: 'CAPA' } },
      { path: 'reference-audits', component: SupplierPartsRefComponent, data: { breadcrumb: 'Reference Audits' } }
    ]
  }
];

@NgModule({
  declarations: [
    SupplierPartsauditsComponent,
    SupPartsActiveComponent,
    SupPartsCapaComponent
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
export class SupplierPartsauditsModule { }
