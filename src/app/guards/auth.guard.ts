import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthTokenService } from '../../auth-token.service';
import { UserPermissionService } from '../pages/helpers/user-permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private _router: Router,
    private _authTokenService: AuthTokenService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 1. Check if token exists and is valid in sessionStorage
    // When a URL is copied and pasted into a new tab, sessionStorage is empty,
    // so this check fails and immediately redirects to /login!
    if (!this._authTokenService.isLoggedIn()) {
      this._router.navigate(['/login']);
      return false;
    }

    // 2. Check screen permission if screenId is configured on route.data
    const screenId = route.data?.['screenId'];
    if (screenId !== undefined && screenId !== null) {
      if (UserPermissionService.fnGetReadPermissions(screenId)) {
        return true;
      }
      this._router.navigateByUrl('/error');
      return false;
    }

    return true;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(route, state);
  }
}

/**
 * Functional guard equivalent to AuthGuard.canActivate
 */
export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuard).canActivate(route, state);
};

/**
 * Functional guard equivalent to AuthGuard.canActivateChild
 */
export const authChildGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuard).canActivateChild(route, state);
};

/**
 * Prevents authenticated users from seeing the login screen.
 */
export const noAuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthTokenService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }

  if (auth.getUserType() === 'Supplier') {
    return router.createUrlTree(['/app/supplier-login/dashboard']);
  }

  return router.createUrlTree(['/internal-portal/dashboard']);
};

/**
 * Dynamically resolves root URL ('') based on authentication status.
 */
export const rootGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthTokenService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.getUserType() === 'Supplier') {
    return router.createUrlTree(['/app/supplier-login/dashboard']);
  }

  return router.createUrlTree(['/internal-portal/dashboard']);
};

/**
 * Restricts internal and admin routes from suppliers.
 */
export const internalGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const auth = inject(AuthTokenService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.getUserType() === 'Supplier') {
    return router.createUrlTree(['/app/supplier-login/dashboard']);
  }

  const screenId = route.data?.['screenId'];
  if (screenId !== undefined && screenId !== null) {
    if (!UserPermissionService.fnGetReadPermissions(screenId)) {
      return router.createUrlTree(['/error']);
    }
  }

  return true;
};

/**
 * Restricts supplier portal routes from non-suppliers.
 */
export const supplierGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const auth = inject(AuthTokenService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.getUserType() !== 'Supplier') {
    return router.createUrlTree(['/internal-portal/dashboard']);
  }

  return true;
};
