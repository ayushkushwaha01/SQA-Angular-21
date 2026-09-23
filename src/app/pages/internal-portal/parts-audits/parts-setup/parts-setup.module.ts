import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// Component Imports
import { PartsSetupComponent } from './parts-setup.component';
import { PartsFamiliesComponent } from './parts-families/parts-families.component';
import { PartsMasterComponent } from './parts-master/parts-master.component';
import { AddPartsFamilypopComponent } from './parts-families/add-parts-familypop/add-parts-familypop.component';
import { AddPartspopComponent } from './parts-master/add-partspop/add-partspop.component';
import { SharedModule } from "src/app/shared/shared.module";
import { PartsMasterSuppliersComponent } from './parts-master/parts-master-suppliers/parts-master-suppliers.component';
import { PartsauditcatInnergridComponent } from './audit-categories/partsauditcat-innergrid/partsauditcat-innergrid.component';
import { FamiliesInnerGridComponent } from './parts-families/families-inner-grid/families-inner-grid.component';
import { BatchMasterComponent } from './batch-master/batch-master.component';
import { AddBatchPopComponent } from './batch-master/add-batch-pop/add-batch-pop.component';
import { DefectsMasterComponent } from './defects-master/defects-master.component';
import { PartsFamilyPopComponent } from './defects-master/parts-family-pop/parts-family-pop.component';
import { AddDefectsPopComponent } from './defects-master/add-defects-pop/add-defects-pop.component';
import { VenderRatingComponent } from './vender-rating/vender-rating.component';
import { SupplierMasterComponent } from './supplier-master/supplier-master.component';
import { StateMasterComponent } from './state-master/state-master.component';
import { CityMasterComponent } from './city-master/city-master.component';
import { AddSupplierComponent } from './supplier-master/add-supplier/add-supplier.component';
import { AddCityComponent } from './city-master/add-city/add-city.component';
import { AddStateComponent } from './state-master/add-state/add-state.component';
import { SeverityMasterComponent } from './severity-master/severity-master.component';
import { AddSeverityComponent } from './severity-master/add-severity/add-severity.component';
import { AddVenderComponent } from './vender-rating/add-vender/add-vender.component';
import { AddParameterComponent } from './parts-families/add-parameter/add-parameter.component';
import { PartsParameterComponent } from './parts-master/parts-parameter/parts-parameter.component';
import { AddParameterforpartmasterComponent } from './parts-master/add-parameterforpartmaster/add-parameterforpartmaster.component';
import { BandMasterComponent } from './band-master/band-master.component';
import { DemeritMasterComponent } from './demerit-master/demerit-master.component';
import { OccurrenceMasterComponent } from './occurrence-master/occurrence-master.component';
import { DetectionMasterComponent } from './detection-master/detection-master.component';

// ❌ REMOVED AuditCategoriesComponent, AddPartCategoryComponent, and PartsauditcatInnergridComponent imports from here

const routes: Routes = [
  {
    path: '',
    component: PartsSetupComponent,
    children: [
      {
        path: 'parts-cat',
        loadChildren: () => import('./audit-categories/audit-categories.module').then(m => m.AuditCategoriesModule),
        data: { breadcrumb: 'Parts Audit Categories', description: 'Configure parts audit category master data.' }
      },
      {
        path: 'families',
        data: { breadcrumb: 'Parts Families', description: 'Configure parts families master data.' },
        children: [
          { path: '', component: PartsFamiliesComponent }, // Default view when hitting /families
          { path: 'families-inner-grid', component: FamiliesInnerGridComponent, data: { breadcrumb: 'Family Detail' } } // Child view
        ]
      },
      { path: 'master', component: PartsMasterComponent, data: { breadcrumb: 'Parts Master', description: 'Configure parts master data.' } },
      { path: 'batchmaster', component: BatchMasterComponent, data: { breadcrumb: 'Batch Master', description: 'Configure batch master data.' } },
      { path: 'defectsmaster', component: DefectsMasterComponent, data: { breadcrumb: 'Defects Master', description: 'Configure defects master data.' } },
      { path: 'vender-rating', component: VenderRatingComponent, data: { breadcrumb: 'Vendor Rating', description: 'Configure vendor rating master data.' } },
      { path: 'supplier-master', component: SupplierMasterComponent, data: { breadcrumb: 'Supplier Master', description: 'Configure supplier master data.' } },
      { path: 'city-master', component: CityMasterComponent, data: { breadcrumb: 'City Master', description: 'Configure city master data.' } },
      { path: 'severity-master', component: SeverityMasterComponent, data: { breadcrumb: 'Severity Master', description: 'Configure severity master data.' } },
      { path: 'state-master', component: StateMasterComponent, data: { breadcrumb: 'State Master', description: 'Configure state master data.' } },
      { path: '', redirectTo: 'parts-cat', pathMatch: 'full' },
      { path: 'parts-parameter', component: PartsParameterComponent, data: { breadcrumb: 'Parts Parameter' } },
      { path: 'bandmaster', component: BandMasterComponent, data: { breadcrumb: 'Vendor Rating', description: 'Configure vendor rating master data.' } },
      { path: 'demerit-master', component: DemeritMasterComponent, data: { breadcrumb: 'Demerit', description: 'Configure demerit master data.' } },
      { path: 'occurrence-master', component: OccurrenceMasterComponent, data: { breadcrumb: 'Occurrence', description: 'Configure occurrence master data.' } },
      { path: 'detection-master', component: DetectionMasterComponent, data: { breadcrumb: 'Detection', description: 'Configure detection master data.' } },

    ]
  }
];

@NgModule({
  declarations: [
    PartsSetupComponent,
    PartsFamiliesComponent,
    PartsMasterComponent,
    AddPartsFamilypopComponent,
    AddPartspopComponent,
    PartsMasterSuppliersComponent,
    FamiliesInnerGridComponent,
    BatchMasterComponent,
    AddBatchPopComponent,
    DefectsMasterComponent,
    PartsFamilyPopComponent,
    AddDefectsPopComponent,
    VenderRatingComponent,
    SupplierMasterComponent,
    StateMasterComponent,
    CityMasterComponent,
    AddSupplierComponent,
    AddCityComponent,
    AddStateComponent,
    SeverityMasterComponent,
    AddSeverityComponent,
    AddVenderComponent,
    AddParameterComponent,
    PartsParameterComponent,
    AddParameterforpartmasterComponent,
    BandMasterComponent,
    DemeritMasterComponent,
    OccurrenceMasterComponent,
    DetectionMasterComponent

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatPaginatorModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SharedModule,

  ]
})
export class PartsSetupModule { }