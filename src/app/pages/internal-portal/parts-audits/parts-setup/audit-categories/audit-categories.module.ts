import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ✅ ADDED: Material imports needed for your grids and popups
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { AuditCategoriesComponent } from './audit-categories.component';
import { PartsauditcatInnergridComponent } from './partsauditcat-innergrid/partsauditcat-innergrid.component';
import { AddPartCategoryComponent } from './add-part-category/add-part-category.component';

// Define the routes for this module
const routes: Routes = [
  { path: '', component: AuditCategoriesComponent },
  { path: 'inner', component: PartsauditcatInnergridComponent }
];

@NgModule({
  declarations: [
    AuditCategoriesComponent,
    PartsauditcatInnergridComponent,
    AddPartCategoryComponent // ✅ ADDED: Your popup component belongs here now
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // ✅ ADDED: Import dependencies for the components declared above
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatTooltipModule,
    ReactiveFormsModule
  ]
})
export class AuditCategoriesModule { }