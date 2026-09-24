import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, rootGuard } from './guards/auth.guard';

export const routes: Routes = [

  // ✅ AUTH PAGES
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(c => c.LoginComponent)
  },
  {
    path: 'login/login-page',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'forgot',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/login/forgot/forgot.component')
        .then(c => c.ForgotComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/login/forgot/forgot.component')
        .then(c => c.ForgotComponent)
  },
  {
    path: 'login/forgot',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/login/forgot/forgot.component')
        .then(c => c.ForgotComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/login/reset-password-with-token-component/reset-password-with-token-component.component')
        .then(c => c.ResetPasswordWithTokenComponentComponent)
  },
  {
    path: 'reset-password-with-token',
    loadComponent: () =>
      import('./pages/login/reset-password-with-token-component/reset-password-with-token-component.component')
        .then(c => c.ResetPasswordWithTokenComponentComponent)
  },

  // ✅ ROOT ROUTE: Dynamically redirects to dashboard if authenticated, or login if not
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootGuard],
    children: []
  },

  // ✅ MAIN APP AFTER LOGIN (PROTECTED)
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/pages.routes')
        .then(m => m.routes)
  },

  // ❌ ERROR PAGE
  {
    path: 'error',
    loadComponent: () =>
      import('./pages/errors/error/error.component')
        .then(c => c.ErrorComponent)
  },

  // ❌ NOT FOUND
  {
    path: '**',
    loadComponent: () =>
      import('./pages/errors/not-found/not-found.component')
        .then(c => c.NotFoundComponent)
  }
];
