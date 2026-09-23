// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserPermissionService {

//   private static getPermissions(screenId: number | string): any {
//     try {
//       const perms = JSON.parse(localStorage.getItem('rolePermissions') || '[]');
//       if (Array.isArray(perms)) {
//         return perms.find((p: any) => 
//           p.screenId === screenId || 
//           p.ScreenId === screenId || 
//           p.id === screenId || 
//           (typeof screenId === 'string' && (p.screenName === screenId || p.ScreenName === screenId || p.name === screenId))
//         );
//       }
//     } catch (e) {
//       console.error('Error parsing rolePermissions from localStorage', e);
//     }
//     return null;
//   }

//   static fnGetReadPermissions(screenId: number | string): boolean {
//     const p = this.getPermissions(screenId);
//     if (!p) return true; // Default allow if not restricted
//     return !!(p.btRead ?? p.canRead ?? p.read ?? p.value1 ?? true);
//   }

//   static fnGetCreatePermissions(screenId: number | string): boolean {
//     const p = this.getPermissions(screenId);
//     if (!p) return true;
//     return !!(p.btCreate ?? p.canCreate ?? p.create ?? p.value2 ?? true);
//   }

//   static fnGetUpdatePermissions(screenId: number | string): boolean {
//     const p = this.getPermissions(screenId);
//     if (!p) return true;
//     return !!(p.btUpdate ?? p.canUpdate ?? p.update ?? p.value3 ?? true);
//   }

//   static fnGetDeletePermissions(screenId: number | string): boolean {
//     const p = this.getPermissions(screenId);
//     if (!p) return true;
//     return !!(p.btDelete ?? p.canDelete ?? p.delete ?? p.value4 ?? true);
//   }
// }


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {

  constructor() { }

  /**
   * Retrieves the saved permissions array from LocalStorage.
   * Handles both flat array of screens or nested module structures.
   */
  private static getPermissions(): any[] {
    const rolePermissions = localStorage.getItem('rolePermissions');
    if (!rolePermissions) return [];
    try {
      const parsed = JSON.parse(rolePermissions);
      if (Array.isArray(parsed)) {
        // If nested structure (modules -> screens), flatten screens
        let allScreens: any[] = [];
        parsed.forEach((item: any) => {
          if (item.screens && Array.isArray(item.screens)) {
            allScreens.push(...item.screens);
          } else {
            allScreens.push(item);
          }
        });
        return allScreens;
      }
      return [];
    } catch {
      return [];
    }
  }

  private static findScreen(screenId: number | string): any {
    const screens = this.getPermissions();
    if (!screens || screens.length === 0) return null;

    return screens.find((x: any) => 
      x.userScreenId === screenId || 
      x.UserScreenId === screenId || 
      x.screenId === screenId || 
      x.ScreenId === screenId ||
      (x.screenName && screenId && x.screenName.toString().trim().toLowerCase() === screenId.toString().trim().toLowerCase()) ||
      (x.UserScreenName && screenId && x.UserScreenName.toString().trim().toLowerCase() === screenId.toString().trim().toLowerCase())
    );
  }

  // ==========================================
  // ---------- PERMISSION CHECKS -------------
  // ==========================================

  static fnGetReadPermissions(screenId: number | string): boolean {
    const screen = this.findScreen(screenId);
    if (!screen) return false;
    const val = screen.canRead !== undefined ? screen.canRead : screen.read;
    return val === true || val === 'true';
  }

  static fnGetCreatePermissions(screenId: number | string): boolean {
    const screen = this.findScreen(screenId);
    if (!screen) return false;
    const val = screen.canCreate !== undefined ? screen.canCreate : screen.create;
    return val === true || val === 'true';
  }

  static fnGetUpdatePermissions(screenId: number | string): boolean {
    const screen = this.findScreen(screenId);
    if (!screen) return false;
    const val = screen.canUpdate !== undefined ? screen.canUpdate : screen.update;
    return val === true || val === 'true';
  }

  static fnGetDeletePermissions(screenId: number | string): boolean {
    const screen = this.findScreen(screenId);
    if (!screen) return false;
    const val = screen.canDelete !== undefined ? screen.canDelete : screen.delete;
    return val === true || val === 'true';
  }

  // ==========================================
  // ---------- MENU HELPERS ------------------
  // ==========================================

  static fnGetAccessibleModules(): number[] {
    const screens = this.getPermissions();
    const moduleIds: number[] = [];

    screens.forEach((x: any) => {
      const isReadable = (x.canRead === true || x.canRead === 'true' || x.read === true || x.read === 'true');
      const modId = x.userModuleId || x.UserModuleId || x.moduleId;
      if (isReadable && modId && !moduleIds.includes(modId)) {
        moduleIds.push(modId);
      }
    });

    return moduleIds;
  }
}