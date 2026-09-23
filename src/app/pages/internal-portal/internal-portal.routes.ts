import { Routes } from '@angular/router';
import { InternalPortalComponent } from './internal-portal.component';
import { InternalPortalDashboardComponent } from './internal-portal-dashboard/internal-portal-dashboard.component';

export const INTERNAL_PORTAL_ROUTES: Routes = [
  {
    path: '',
    component: InternalPortalComponent,
    children: [
      { path: '', component: InternalPortalDashboardComponent, data: { breadcrumb: 'Dashboard', description: 'Internal portal overview and system key metrics.' } },
      { path: 'dashboard', component: InternalPortalDashboardComponent, data: { breadcrumb: 'Dashboard', description: 'Internal portal overview and system key metrics.' } },



      {
        path: 'process',
        loadChildren: () => import('./process-audits/process-audits.module').then(m => m.ProcessAuditsModule),
        data: { breadcrumb: 'Process Audit', description: 'Manage and track process audits.' }
      },
      {
        path: 'parts',
        loadChildren: () => import('./parts-audits/parts-audits.module').then(m => m.PartsAuditsModule),
        data: { breadcrumb: 'Parts Audit', description: 'Manage and track parts audits.' }
      },
      {
        path: 'process-inner-screen',
        loadChildren: () => import('./process-inner-screen/process-inner-screen.module').then(m => m.ProcessInnerScreen),
        data: { breadcrumb: 'Process Details', description: 'Detailed view of a process audit.' }
      },
      {
        path: 'parts-inner-screen',
        loadChildren: () => import('./parts-inner-screen/parts-inner-screen.module').then(m => m.PartsInnerScreen),
        data: { breadcrumb: '', description: '' }
      },
      {
        path: 'inspection',
        loadChildren: () => import('./inspection/inspection.module').then(m => m.InspectionModule),
        data: { breadcrumb: 'Inspection', description: 'Incoming inspection records.' }
      },
      {
        path: 'inspect-inner-screen',
        loadChildren: () => import('./inspect-inner-screen/inspect-inner-screen.module').then(m => m.InspectInnerScreenModule),
        data: { breadcrumb: 'Inspection Details', description: 'Detailed inspection record.' }
      }
    ]
  }
];
