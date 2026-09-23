import { Routes } from '@angular/router';

export const routes: Routes = [

  // ✅ LOGIN FIRST
  {
    path: 'login',
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
    loadComponent: () =>
      import('./pages/login/forgot/forgot.component')
        .then(c => c.ForgotComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/login/forgot/forgot.component')
        .then(c => c.ForgotComponent)
  },
  {
    path: 'login/forgot',
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

  // ✅ REDIRECT ROOT TO LOGIN
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ✅ MAIN APP AFTER LOGIN
  {
    path: '',
    loadChildren: () =>
      import('./pages/pages.routes')
        .then(m => m.routes)
  },

  // ❌ NOT FOUND
  {
    path: '**',
    loadComponent: () =>
      import('./pages/errors/not-found/not-found.component')
        .then(c => c.NotFoundComponent)
  }
];
