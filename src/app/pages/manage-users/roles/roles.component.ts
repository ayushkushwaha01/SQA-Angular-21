
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

import { AlertService } from '../../../shared/alert.service';
import { AddRolesComponent } from './add-roles/add-roles.component';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ManageUsersService } from '../manage-users.service';
import { StatusChangeComponent } from '../../../status-change/status-change.component';
import { UserPermissionService } from '../../helpers/user-permission.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTableModule
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit, AfterViewInit {

  // 🔥 2. Permission Variables (Screen ID 2 = Roles)
  canRead: boolean = false;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  readonly SCREEN_ID: number = 2;

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 10;
  filterForm!: FormGroup;
  filterToggle = false;

  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private api: ManageUsersService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    // 🔥 3. Load Permissions
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

    // 🔥 4. Block data load if they cannot read
    if (!this.canRead) return;

    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    this.formInit();
    this.getAllData();
    this.setupFilterPredicate();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }

  // Pre-existing lock to prevent anyone from modifying the Master Admin Role
  isActionDisabled(roleName: string): boolean {
    return roleName === 'Admin';
  }

  // 1. GET DATA
  getAllData() {
    this.api.getAllRoles().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataSource.data = res.data;
          if (this.paginator) this.paginator.firstPage();
        }
      },
      error: () => this.alertService.createAlert('Error fetching data', 0)
    });
  }

  // 2. FILTER LOGIC
  setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const search = JSON.parse(filter);

      const keyword = search.keyword.toLowerCase();
      const nameMatch = data.roleName?.toLowerCase().includes(keyword) || false;
      const keywordMatch = !keyword || nameMatch;

      const statusMatch = (search.status === '' || search.status === null) ||
        (data.isActive === search.status);

      return keywordMatch && statusMatch;
    };
  }

  filter() {
    const filterValue = {
      keyword: this.filterForm.value.Keyword,
      status: this.filterForm.value.Status
    };
    this.dataSource.filter = JSON.stringify(filterValue);
  }

  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.dataSource.filter = '';
  }

  // 3. ADD / EDIT DIALOG
  public openRoleDialog(item: any = null) {
    // 🔥 Protection Guard
    if (!item && !this.canCreate) return;
    if (item && !this.canUpdate) return;

    const dialogRef = this.dialog.open(AddRolesComponent, {
      width: '600px',
      maxWidth: '100vw',
      height: 'auto',
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getAllData();
    });
  }

  // 4. DELETE
  deleteConfirmation(item: any) {
    // 🔥 Protection Guard
    if (!this.canDelete || this.isActionDisabled(item.roleName)) return;

    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.api.deleteRole(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getAllData();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  // 5. STATUS TOGGLE
  toggleStatus(item: any) {
    // 🔥 Protection Guard
    if (!this.canUpdate || this.isActionDisabled(item.roleName)) return;

    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleStatus(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message, 1);
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
}