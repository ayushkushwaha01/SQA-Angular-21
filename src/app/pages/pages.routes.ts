import { Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { MasterUsersComponent } from './manage-users/manage-users.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./internal-portal/internal-portal-dashboard/internal-portal-dashboard.component')
            .then(c => c.InternalPortalDashboardComponent),
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'project-dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component')
            .then(c => c.DashboardComponent),
        data: { breadcrumb: 'Project Dashboard' }
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(c => c.UsersComponent),
        data: { breadcrumb: 'Users' }
      },
      {
        path: 'ui',
        loadChildren: () => import('./ui/ui.routes').then(p => p.routes),
        data: { breadcrumb: 'UI' }
      },
      {
        path: 'dynamic-menu',
        loadComponent: () => import('./dynamic-menu/dynamic-menu.component').then(c => c.DynamicMenuComponent),
        data: { breadcrumb: 'Dynamic Menu' }
      },
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat.component').then(c => c.ChatComponent),
        data: { breadcrumb: 'Chat' }
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.routes').then(p => p.routes),
        data: { breadcrumb: 'Profile' }
      },
      {
        path: 'icons',
        loadComponent: () => import('./icons/icons.component').then(c => c.IconsComponent),
        data: { breadcrumb: 'Icons' }
      },
      {
        path: 'blank',
        loadComponent: () => import('./blank/blank.component').then(c => c.BlankComponent),
        data: { breadcrumb: 'Blank page' }
      },
      {
        path: 'admin/departments',
        loadComponent: () =>
          import('./department-master/department-master.component')
            .then(c => c.DepartmentMasterComponent),
        data: { breadcrumb: 'Departments', description: 'Choices that appear in drop down select boxes are updated here.' }
      },
      {
        path: 'manage-users/departments',
        loadComponent: () =>
          import('./department-master/department-master.component')
            .then(c => c.DepartmentMasterComponent),
        data: { breadcrumb: 'Departments', description: 'Choices that appear in drop down select boxes are updated here.' }
      },
      {
        path: 'admin/lookup-options',
        loadComponent: () =>
          import('./lookup-master/lookup-master.component')
            .then(c => c.LookupMasterComponent),
        data: { breadcrumb: 'Lookup Options', description: 'Manage lookup options and code master values.' }
      },
      {
        path: 'manage-users/lookup-options',
        loadComponent: () =>
          import('./lookup-master/lookup-master.component')
            .then(c => c.LookupMasterComponent),
        data: { breadcrumb: 'Lookup Options', description: 'Manage lookup options and code master values.' }
      },
      {
        path: 'manage-users/lookup',
        loadComponent: () =>
          import('./lookup-master/lookup-master.component')
            .then(c => c.LookupMasterComponent),
        data: { breadcrumb: 'Lookup Options', description: 'Manage lookup options and code master values.' }
      },
      {
        path: 'admin/preferences',
        loadComponent: () =>
          import('./preferences/preferences.component')
            .then(c => c.PreferencesComponent),
        data: { breadcrumb: 'Preferences', description: 'Configure application preferences and settings.' }
      },
      {
        path: 'manage-users/preferences',
        loadComponent: () =>
          import('./preferences/preferences.component')
            .then(c => c.PreferencesComponent),
        data: { breadcrumb: 'Preferences', description: 'Configure application preferences and settings.' }
      },
      {
        path: 'admin/event-log',
        loadComponent: () =>
          import('./event-log/event-log.component')
            .then(c => c.EventLogComponent),
        data: { breadcrumb: 'Event Log', description: 'Audit trail and system event logs.' }
      },
      {
        path: 'manage-users/event-log',
        loadComponent: () =>
          import('./event-log/event-log.component')
            .then(c => c.EventLogComponent),
        data: { breadcrumb: 'Event Log', description: 'Audit trail and system event logs.' }
      },
      {
        path: 'admin/escalation-matrix',
        loadComponent: () =>
          import('./escalation-matrix/escalation-matrix.component')
            .then(c => c.EscalationMatrixComponent),
        data: { breadcrumb: 'Escalation Matrix', description: 'Configure CAPA and audit escalation triggers.' }
      },
      {
        path: 'manage-users/escalation-matrix',
        loadComponent: () =>
          import('./escalation-matrix/escalation-matrix.component')
            .then(c => c.EscalationMatrixComponent),
        data: { breadcrumb: 'Escalation Matrix', description: 'Configure CAPA and audit escalation triggers.' }
      },
      {
        path: 'manage-users',
        loadChildren: () =>
          import('./manage-users/users.routes')
            .then(m => m.USERS_ROUTES),
        data: { breadcrumb: 'Admin', description: 'System user management, roles, permissions and supplier management.' }
      },
      {
        path: 'internal-portal',
        loadChildren: () =>
          import('./internal-portal/internal-portal.routes')
            .then(m => m.INTERNAL_PORTAL_ROUTES)
      },
      {
        path: 'app/sqm',
        loadChildren: () =>
          import('./internal-portal/internal-portal.routes')
            .then(m => m.INTERNAL_PORTAL_ROUTES)
      }
    ]
  }
];