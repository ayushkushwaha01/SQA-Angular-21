import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PartsCommodityComponent } from './parts-commodity.component';
import { PartsAllComponent } from './parts-all/parts-all.component';
import { PartsCastingComponent } from './parts-casting/parts-casting.component';
import { PartsForgingComponent } from './parts-forging/parts-forging.component';
import { PartsMarchiningComponent } from './parts-marchining/parts-marchining.component';
import { PartsFastenersComponent } from './parts-fasteners/parts-fasteners.component';
import { PartsNonmetalicComponent } from './parts-nonmetalic/parts-nonmetalic.component';
import { PartsSheetmetalComponent } from './parts-sheetmetal/parts-sheetmetal.component';
import { PartsProprietaryComponent } from './parts-proprietary/parts-proprietary.component';

const routes: Routes = [
  {
    path: '',
    component: PartsCommodityComponent,   // ← parent shell with <router-outlet>
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all',          component: PartsAllComponent },
      { path: 'casting',      component: PartsCastingComponent },
      { path: 'forging',      component: PartsForgingComponent },
      { path: 'machining',    component: PartsMarchiningComponent },
      { path: 'fasteners',    component: PartsFastenersComponent },
      { path: 'non-metallic', component: PartsNonmetalicComponent },
      { path: 'sheet-metal',  component: PartsSheetmetalComponent },
      { path: 'proprietary',  component: PartsProprietaryComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartsCommodityRoutingModule { }