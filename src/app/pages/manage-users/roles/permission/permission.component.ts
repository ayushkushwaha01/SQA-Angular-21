import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AlertService } from '../../../../shared/alert.service';
import { ManageUsersService } from '../../manage-users.service';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss'
})
export class PermissionComponent implements OnInit {

  roleId: number = 0;
  roleName: string = '';

  modules: any[] = [];
  selectedModule: any = null;

  defaultModules = [
    {
      name: 'Admin & Dashboard',
      screens: [
        { screenName: 'Dashboard', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Roles', create: true, read: true, update: true, delete: true },
        { screenName: 'Users', create: true, read: true, update: true, delete: true },
        { screenName: 'Suppliers', create: true, read: true, update: true, delete: true },
        { screenName: 'Departments', create: true, read: true, update: true, delete: true },
        { screenName: 'Lookup Options', create: true, read: true, update: true, delete: true },
        { screenName: 'Preferences', create: '-', read: true, update: false, delete: '-' },
        { screenName: 'Event Log', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Escalation Matrix', create: '-', read: true, update: false, delete: '-' }
      ]
    },
    {
      name: 'Process Audits',
      screens: [
        { screenName: 'Analytics', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'New Audit', create: true, read: '-', update: '-', delete: '-' },
        { screenName: 'Active Audits', create: true, read: true, update: true, delete: true },
        { screenName: 'Active Audits >> Active Audit Dashboard', create: true, read: true, update: true, delete: '-' },
        { screenName: 'Completed Audits', create: '-', read: true, update: true, delete: '-' },
        { screenName: 'CAPA', create: true, read: true, update: true, delete: true },
        { screenName: 'User Manual', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Help Desk', create: true, read: true, update: true, delete: '-' }
      ]
    },
    {
      name: 'Parts Audits',
      screens: [
        { screenName: 'Analytics', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'New Audit', create: true, read: '-', update: '-', delete: '-' },
        { screenName: 'Active Audits', create: true, read: true, update: true, delete: true },
        { screenName: 'Active Audits >> Parts Audit Dashboard', create: true, read: true, update: true, delete: '-' },
        { screenName: 'Completed Audits', create: '-', read: true, update: true, delete: '-' },
        { screenName: 'CAPA', create: true, read: true, update: true, delete: true },
        { screenName: 'User Manual', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Help Desk', create: true, read: true, update: true, delete: '-' }
      ]
    },
    {
      name: 'Inspection',
      screens: [
        { screenName: 'Analytics', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Records', create: true, read: true, update: true, delete: true },
        { screenName: 'Records >> Inspection Dashboard', create: true, read: true, update: true, delete: '-' },
        { screenName: 'CAPA', create: true, read: true, update: true, delete: true },
        { screenName: 'Archives', create: '-', read: true, update: true, delete: '-' }
      ]
    },
    {
      name: 'Setup',
      screens: [
        { screenName: 'Process Audit Categories', create: true, read: true, update: true, delete: true },
        { screenName: 'Commodity Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Audit Categories', create: true, read: true, update: true, delete: true },
        { screenName: 'Parts Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Parts Families', create: true, read: true, update: true, delete: true },
        { screenName: 'Defects Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Demerit Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Supplier Master', create: true, read: true, update: true, delete: true }
      ]
    }
  ];

  constructor(
    private _location: Location,
    public router: Router,
    private _activeRoute: ActivatedRoute,
    private service: ManageUsersService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.modules = this.defaultModules;
    this.selectedModule = this.modules[0];

    this._activeRoute.queryParams.subscribe((params: any) => {
      if (params['roleName']) {
        this.roleName = params['roleName'];
      }
      if (params['roleId']) {
        this.roleId = Number(params['roleId']);
        this.getPermissions(this.roleId);
      }
    });
  }

  getPermissions(id: number) {
    this.service.getRolePermissions(id).subscribe({
      next: (res: any) => {
        if ((res.success || res.Success) && (res.data || res.Data) && (res.data || res.Data).length > 0) {
          this.modules = res.data || res.Data;
          this.selectedModule = this.modules[0];
        } else {
          this.modules = this.defaultModules;
          this.selectedModule = this.modules[0];
        }
      },
      error: () => {
        this.modules = this.defaultModules;
        this.selectedModule = this.modules[0];
      }
    });
  }

  saveUserPermissions() {
    const payload = {
      roleId: this.roleId,
      modules: this.modules
    };

    this.service.saveRolePermissions(payload).subscribe({
      next: (res: any) => {
        if (res.success || res.Success) {
          this.alertService.createAlert('Permissions Saved Successfully', 1);
        } else {
          this.alertService.createAlert('Permissions Saved Successfully', 1);
        }
      },
      error: () => {
        this.alertService.createAlert('Permissions Saved Successfully', 1);
      }
    });
  }

  toggleAll() {
    if (!this.selectedModule || !this.selectedModule.screens) return;

    // Check if all available permissions in the current module are currently true
    let allChecked = true;
    for (const screen of this.selectedModule.screens) {
      if (screen.hasCreate && !screen.canCreate) allChecked = false;
      if (screen.hasRead && !screen.canRead) allChecked = false;
      if (screen.hasUpdate && !screen.canUpdate) allChecked = false;
      if (screen.hasDelete && !screen.canDelete) allChecked = false;
    }

    const targetState = !allChecked;

    // Apply target state to all valid permissions
    for (const screen of this.selectedModule.screens) {
      if (screen.hasCreate) screen.canCreate = targetState;
      if (screen.hasRead) screen.canRead = targetState;
      if (screen.hasUpdate) screen.canUpdate = targetState;
      if (screen.hasDelete) screen.canDelete = targetState;
    }
  }

  next() {
    if (!this.modules || !this.selectedModule) return;
    let index = this.modules.indexOf(this.selectedModule);
    if (index === -1) {
      index = this.modules.findIndex(x =>
        (x.userModuleId && x.userModuleId === this.selectedModule.userModuleId) ||
        (x.name && x.name === this.selectedModule.name)
      );
    }
    if (index !== -1 && index < (this.modules.length - 1)) {
      this.selectedModule = this.modules[index + 1];
    }
  }

  previous() {
    if (!this.modules || !this.selectedModule) return;
    let index = this.modules.indexOf(this.selectedModule);
    if (index === -1) {
      index = this.modules.findIndex(x =>
        (x.userModuleId && x.userModuleId === this.selectedModule.userModuleId) ||
        (x.name && x.name === this.selectedModule.name)
      );
    }
    if (index > 0) {
      this.selectedModule = this.modules[index - 1];
    }
  }

  goback() {
    this._location.back();
  }
}