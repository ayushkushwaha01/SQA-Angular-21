import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { AddDepartmentDialogComponent } from './add-department-dialog/add-department-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusConfirmationDialogComponent } from '../status-confirmation-dialog/status-confirmation-dialog.component';
import { DepartmentService } from './department.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';


@Component({
  selector: 'app-department-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule
  ],
  templateUrl: './department-master.component.html',
  styleUrl: './department-master.component.scss',
})
export class DepartmentMasterComponent implements OnInit {
  allDepartments: any[] = []; // Holds the original unfiltered data
  filteredDepartments: any[] = []; // Holds data after applying filters
  tableList: any[] = []; // Holds data for the current page
  uniqueDeptCodes: string[] = []; // For the Department Code dropdown

  filterToggle: boolean = false;

  // Filter Models
  filterKeyword: string = '';
  filterStatus: boolean | null = null;
  filterDeptCodes: string[] = [];

  // Pagination Variables
  totalSize: number = 0;
  currentPage: number = 0;
  pageSize: number = 5;

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 5;

  constructor(
    private dialog: MatDialog,
    private departmentService: DepartmentService
  ) { }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID) || UserPermissionService.fnGetReadPermissions('Departments');
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetCreatePermissions('Departments');
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetUpdatePermissions('Departments');
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID) || UserPermissionService.fnGetDeletePermissions('Departments');
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    if (this.canRead) {
      this.getDepartments();
    }
  }

  getDepartments() {
    this.departmentService.getAllDepartments().subscribe((response: any) => {
      if (response && response.success) {
        this.allDepartments = response.data || [];

        // Extract unique department codes for the filter dropdown
        this.uniqueDeptCodes = [...new Set(this.allDepartments.map(item => item.departmentCode))].filter(Boolean);

        // Apply filters initially to load the grid and pagination
        this.applyFilters();
      }
    });
  }

  // --- FILTER LOGIC ---
  applyFilters() {
    this.filteredDepartments = this.allDepartments.filter(item => {
      // 1. Keyword Filter (Checks Name, Code, and Head)
      let matchesKeyword = true;
      if (this.filterKeyword) {
        const keyword = this.filterKeyword.toLowerCase();
        matchesKeyword = (
          (item.departmentName?.toLowerCase().includes(keyword)) ||
          (item.departmentCode?.toLowerCase().includes(keyword)) ||
          (item.departmentHead?.toLowerCase().includes(keyword))
        );
      }

      // 2. Status Filter
      let matchesStatus = true;
      if (this.filterStatus !== null && this.filterStatus !== undefined) {
        matchesStatus = item.isActive === this.filterStatus;
      }

      // 3. Department Code Filter (Multiple selection)
      let matchesCode = true;
      if (this.filterDeptCodes && this.filterDeptCodes.length > 0) {
        matchesCode = this.filterDeptCodes.includes(item.departmentCode);
      }

      return matchesKeyword && matchesStatus && matchesCode;
    });

    // Reset pagination to first page after search
    this.totalSize = this.filteredDepartments.length;
    this.currentPage = 0;
    this.updatePagination();
  }

  clearFilters() {
    this.filterKeyword = '';
    this.filterStatus = null;
    this.filterDeptCodes = [];
    this.applyFilters();
  }

  // --- PAGINATION LOGIC ---
  handlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.tableList = this.filteredDepartments.slice(startIndex, endIndex);
  }

  // --- CRUD OPERATIONS ---
  addmodule(item: any) {
    let dialogRef = this.dialog.open(AddDepartmentDialogComponent, {
      data: item,
      height: 'auto',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'success') {
        this.getDepartments();
      }
    });
  }

  Confirmation(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      data: { title: 'Change Status', content: `Are you sure you want to change the status of ${item.departmentName}?` }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const payload = { departmentId: item.departmentId };
        this.departmentService.toggleDepartmentStatus(payload).subscribe((apiRes: any) => {
          if (apiRes && apiRes.success) {
            this.getDepartments();
          }
        });
      }
    });
  }

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',

      data: {
        title: 'Delete Confirmation',
        content: `Are you sure you want to delete the department: ${item.departmentName}?`
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const payload = { departmentId: item.departmentId, deletedBy: 1 };

        this.departmentService.deleteDepartment(payload).subscribe((apiRes: any) => {
          if (apiRes && apiRes.success) {
            this.getDepartments();
          } else {
            alert(apiRes ? apiRes.message : "Failed to delete department.");
          }
        });
      }
    });
  }
}
