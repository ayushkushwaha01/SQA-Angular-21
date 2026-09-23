import { Routes } from '@angular/router';
import { MasterUsersComponent } from './manage-users.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { PermissionComponent } from './roles/permission/permission.component';
import { SupplierComponent } from './Supplier/supplier.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: MasterUsersComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent, data: { breadcrumb: 'Users', description: 'Manage system users and access permissions.' } },
      { path: 'roles', component: RolesComponent, data: { breadcrumb: 'Roles', description: 'Configure user roles and security group assignments.' } },
      { path: 'roles/permission', component: PermissionComponent, data: { breadcrumb: 'Permissions', description: 'Configure screen-level read, write, create, and delete permissions.' } },
      { path: 'suppliers', component: SupplierComponent, data: { breadcrumb: 'Suppliers', description: 'Manage vendor and supplier profiles.' } },
      { path: 'supplier', component: SupplierComponent, data: { breadcrumb: 'Supplier', description: 'Manage vendor and supplier profiles.' } }
    ]
  }
];
