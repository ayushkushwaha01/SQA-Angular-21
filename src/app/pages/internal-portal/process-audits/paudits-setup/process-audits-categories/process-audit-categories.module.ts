import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

// Components






import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QuillModule } from 'ngx-quill';
import { AuditCategoriesComponent } from '../../../parts-audits/parts-setup/audit-categories/audit-categories.component';
import { AddQuestionPopComponent } from './audit-categories-innerscreen/question-pop/question-pop.component';
import { CommodityMasterComponent } from '../commodity-master/commodity-master.component';
import { AuditCategoriesInnerscreenComponent } from './audit-categories-innerscreen/audit-categories-innerscreen.component';


const routes: Routes = [
  {
    path: '',
    component: CommodityMasterComponent, // This becomes the parent
    children: [
      { path: 'process-inner-grid', component: AuditCategoriesInnerscreenComponent }
    ]
  }
];

@NgModule({
  declarations: [


    AddQuestionPopComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),// Sets up the child routing
    FormsModule,

    // Material Modules
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
    QuillModule.forRoot()
  ]
})
export class processauditcategoriesmodule { }