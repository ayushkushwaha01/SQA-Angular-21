import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CommodityMasterComponent } from './commodity-master.component';
import { AddCommodityPopComponent } from './add-commodity-pop/add-commodity-pop.component';
import { CommodityInnerGridComponent } from './commodity-inner-grid/commodity-inner-grid.component';
import { AddQuestionPopComponent } from './commodity-inner-grid/add-question-pop/add-question-pop.component';
import { AddTargetPopComponent } from './commodity-inner-grid/add-target-pop/add-target-pop.component';

const routes: Routes = [
  {
    path: '',
    component: CommodityMasterComponent,
    children: [
      { path: 'inner-grid', component: CommodityInnerGridComponent }
    ]
  }
];

@NgModule({
  declarations: [
    CommodityMasterComponent,
    AddCommodityPopComponent,
    CommodityInnerGridComponent,
    AddQuestionPopComponent,
    AddTargetPopComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class CommodityMasterModule { }