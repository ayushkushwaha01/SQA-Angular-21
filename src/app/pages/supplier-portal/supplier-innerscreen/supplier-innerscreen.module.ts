import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Import Inner Screen components
import { SupplierInnerscreenComponent } from './supplier-innerscreen.component';
import { SupplierProcessRefComponent } from './supplier-process-ref/supplier-process-ref.component';
import { SupplierCapaRefComponent } from './supplier-capa-ref/supplier-capa-ref.component';
import { SupplierPartsRefComponent } from './supplier-parts-ref/supplier-parts-ref.component';
import { SupplierPartsCapaComponent } from './supplier-parts-capa/supplier-parts-capa.component';
import { SupplierPartsDetailsComponent } from './supplier-parts-details/supplier-parts-details.component';

// Optional: Import only the Material/Shared modules you actually use in these specific screens
import { SharedModule } from 'src/app/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { InsActiveRefComponent } from './ins-active-ref/ins-active-ref.component';
import { InsCapaRefComponent } from './ins-capa-ref/ins-capa-ref.component';
import { PartsCapaDetailsComponent } from './parts-capa-details/parts-capa-details.component';
import { InsCapaDetailsComponent } from './ins-capa-details/ins-capa-details.component';
import { PartsCapaComponent } from './parts-capa/parts-capa.component';
import { InsCapaComponent } from './ins-capa/ins-capa.component';
import { SuppAddSampleComponent } from './supp-add-sample/supp-add-sample.component';

const routes: Routes = [
  {
    path: '',
    component: SupplierInnerscreenComponent,
    children: [
      { path: 'process-ref', component: SupplierProcessRefComponent },
      { path: 'capa-ref', component: SupplierCapaRefComponent },
      { path: 'parts-ref', component: SupplierPartsRefComponent, data: { breadcrumb: 'Part Audit Dashboard' } },
      { path: 'parts-capa', component: SupplierPartsCapaComponent },
      { path: 'parts-details', component: SupplierPartsDetailsComponent },
      { path: 'ins-active-ref', component: InsActiveRefComponent },
      { path: 'ins-capa-ref', component: InsCapaRefComponent },
      { path: 'part-inner-capa', component: PartsCapaComponent },
      { path: 'ins-inner-capa', component: InsCapaComponent },
      { path: 'ins-sample', component: SuppAddSampleComponent },

    ]
  }
];

@NgModule({
  declarations: [
    SupplierInnerscreenComponent,
    SupplierProcessRefComponent,
    SupplierCapaRefComponent,
    SupplierPartsRefComponent,
    SupplierPartsCapaComponent,
    SupplierPartsDetailsComponent,
    InsActiveRefComponent,
    InsCapaRefComponent,
    PartsCapaDetailsComponent,
    InsCapaDetailsComponent,
    PartsCapaComponent,
    InsCapaComponent,
    SuppAddSampleComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class SupplierInnerscreenModule { }