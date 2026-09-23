

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { ManageUsersService } from '../manage-users.service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from '../../../shared/alert.service';
import { StatusChangeComponent } from '../../../status-change/status-change.component';
import { SupplierResetPasswordComponent } from './supplier-reset-password/supplier-reset-password.component';
import { UserPermissionService } from '../../helpers/user-permission.service'; 

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss'
})
export class SupplierComponent implements OnInit {

  // 🔥 2. Permission Variables (Screen ID 4 = Suppliers)
  canRead: boolean = false;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  readonly SCREEN_ID: number = 4;

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 10;
  filterForm!: FormGroup;
  filterToggle = false;
  allData: any[] = [];
  Status = [{ name: 'Active', value: true }, { name: 'Inactive', value: false }];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.filterForm = this.fb.group({ Keyword: [''], Status: [''] });
  }

  ngOnInit(): void {
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

    this.loadSuppliers();
  }

  loadSuppliers() {
    this.api.getSuppliers().subscribe((res: any) => {
      if (res.success) {
        this.allData = res.data;
        this.dataSource.data = this.allData;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  openAddSupplier(item: any = null) {
    // 🔥 Protection Guard
    if (!item && !this.canCreate) return; // Block Add
    if (item && !this.canUpdate) return; // Block Edit

    let dialogRef = this.dialog.open(AddSupplierComponent, {
      data: item,
      width: '850px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => { if (res) this.loadSuppliers(); });
  }

  deleteSupplier(item: any) {
    // 🔥 Protection Guard
    if (!this.canDelete) return;

    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteSupplier(item.supplierId).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.loadSuppliers();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  toggleStatus(item: any) {
    // 🔥 Protection Guard
    if (!this.canUpdate) return;

    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleSupplierStatus(item.supplierId).subscribe({
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

  resetPassword(item: any) {
    // 🔥 Protection Guard
    if (!this.canUpdate) return;

    this.dialog.open(SupplierResetPasswordComponent, {
      data: item,
      width: '550px'
    });
  }

  filter() {
    const keyword = this.filterForm.value.Keyword?.toLowerCase() || '';
    const status = this.filterForm.value.Status;

    let filtered = this.allData.filter(item =>
    (item.supplierName.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.userName.toLowerCase().includes(keyword))
    );

    if (status !== '' && status !== null) {
      filtered = filtered.filter(item => item.isActive === status);
    }
    this.dataSource.data = filtered;
  }

  clearFilter() {
    this.filterForm.reset();
    this.dataSource.data = this.allData;
  }
}