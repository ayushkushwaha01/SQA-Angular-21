import { Routes } from '@angular/router';
import { SupplierPortalComponent } from './supplier-portal.component';

export const SUPPLIER_PORTAL_ROUTES: Routes = [
  {
    path: '',
    component: SupplierPortalComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./supplier-dashboard/supplier-dashboard.component')
            .then(c => c.SupplierDashboardComponent),
        data: { breadcrumb: 'Dashboard', description: 'Supplier overview of all quality audits, corrective actions, and performance metrics.' }
      },
      {
        path: 'process-audits',
        loadChildren: () =>
          import('./supplier-processaudits/supplier-processaudits.module')
            .then(m => m.SupplierProcessauditsModule),
        data: { breadcrumb: 'Process Audits', description: 'Track and manage supplier process audits and corrective actions.' }
      },
      {
        path: 'parts-audits',
        loadChildren: () =>
          import('./supplier-partsaudits/supplier-partsaudits.module')
            .then(m => m.SupplierPartsauditsModule),
        data: { breadcrumb: 'Parts Audits', description: 'Track and manage supplier parts audits and quality parameters.' }
      },
      {
        path: 'inspection',
        loadChildren: () =>
          import('./supplier-inspection/supplier-inspection.module')
            .then(m => m.SupplierInspectionModule),
        data: { breadcrumb: 'Inspection', description: 'Manage incoming supplier inspection records and CAPAs.' }
      },
      {
        path: 'inner-screen',
        loadChildren: () =>
          import('./supplier-innerscreen/supplier-innerscreen.module')
            .then(m => m.SupplierInnerscreenModule),
        data: { breadcrumb: 'Details' }
      },
      {
        path: 'process-inner-screen',
        loadChildren: () =>
          import('../internal-portal/process-inner-screen/process-inner-screen.module')
            .then(m => m.ProcessInnerScreen),
        data: { breadcrumb: 'Process Details', description: 'Detailed view of a process audit.' }
      },
      {
        path: 'parts-inner-screen',
        loadChildren: () =>
          import('../internal-portal/parts-inner-screen/parts-inner-screen.module')
            .then(m => m.PartsInnerScreen),
        data: { breadcrumb: 'Parts Details', description: 'Detailed view of a parts audit.' }
      },
      {
        path: 'inspect-inner-screen',
        loadChildren: () =>
          import('../internal-portal/inspect-inner-screen/inspect-inner-screen.module')
            .then(m => m.InspectInnerScreenModule),
        data: { breadcrumb: 'Inspection Details', description: 'Detailed inspection record.' }
      },
      {
        path: 'process',
        loadChildren: () =>
          import('../internal-portal/process-audits/process-audits.module')
            .then(m => m.ProcessAuditsModule),
        data: { breadcrumb: 'Process Details' }
      }
    ]
  }
];
