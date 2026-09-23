import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddProcessCategoryPopComponent } from './add-process-category-pop/add-process-category-pop.component';
import { ProcessAuditService } from '../process-audit.service';
import { AlertService } from '../../../../../shared/alert.service';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from '../../../../../status-change/status-change.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';


@Component({
  standalone: false,
  selector: 'app-process-audits-categories',
  templateUrl: './process-audits-categories.component.html',
  styleUrls: ['./process-audits-categories.component.scss']
})
export class ProcessAuditsCategoriesComponent implements OnInit {
  showFilters: boolean = false;
  tableData: any[] = [];
  originalTableData: any[] = [];
  selectedCategory: string = '';
  selectedStatus: string = '';

  currentPage: number = 0;
  pageSize: number = 20;
  fromIndex: number = 0;

  totalSize: number = 0;
  filteredTableData: any[] = [];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadCAPAScreen: boolean = false;
  readonly SCREEN_ID: number = 31;


  constructor(
    private dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService
  ) { }

  // ngOnInit(): void {
  //   const gridLength = localStorage.getItem('GridLength');

  //   if (gridLength) {
  //     this.pageSize = Number(gridLength);
  //   }
  //   this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
  //   this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
  //   this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
  //   this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
  //   this.getCategories();
  // }


  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

    // 🔥 THE FIX: Stop loading data if they don't have read access!
    if (!this.canRead) return;

    this.getCategories();
  }

  
  getCategories(): void {
    this.api.getCategories().subscribe((res: any) => {

      if (res.success) {

        this.originalTableData = res.data || [];

        this.applyFilter();
      }
    });
  }


  onSearch(): void {
    this.applyFilter();
  }

  onClear(): void {
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.applyFilter();
  }

  applyFilter(): void {

    let filtered = [...this.originalTableData];

    if (this.selectedCategory) {

      const keyword = this.selectedCategory.trim().toLowerCase();

      filtered = filtered.filter(item =>
        (item.name && item.name.toLowerCase().includes(keyword)) ||
        (item.code && item.code.toLowerCase().includes(keyword))
      );
    }

    if (this.selectedStatus) {

      const isActiveFilter = this.selectedStatus === 'Active';

      filtered = filtered.filter(item =>
        item.isActive === isActiveFilter
      );
    }

    // Store filtered records separately
    this.filteredTableData = filtered;

    // Total filtered records
    this.totalSize = this.filteredTableData.length;

    // Go back to first page after filtering
    this.currentPage = 0;

    // Load first page
    this.loadPageData();
  }
  loadPageData(): void {

    this.fromIndex = this.currentPage * this.pageSize;

    this.tableData = this.filteredTableData.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }
  fnHandlePage(event: any): void {

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;


    this.loadPageData();
  }

  addCategory(item: any): void {
    const dialogRef = this.dialog.open(AddProcessCategoryPopComponent, {
      width: '600px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.alertService.createAlert(item ? 'Category updated successfully.' : 'Category added successfully.', 1);
        this.getCategories(); // Refresh grid on save
      }
    });
  }


  toggleStatus(item: any): void {
    const dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleCategoryStatus(item.processCategoryId).subscribe({
          next: (res: any) => {
            if (res.success) {
              item.isActive = !item.isActive; // Update UI instantly without reloading
              this.alertService.createAlert(res.message || 'Status updated successfully.', 1);
            } else {
              this.alertService.createAlert(res.message || 'Failed to update status.', 0);
            }
          }
        });
      }
    });
  }

  deleteCategory(item: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this Category?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteCategory(item.processCategoryId).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Category deleted successfully.', 1);
              this.getCategories(); // Refresh the grid
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete Category.', 0);
            }
          }
        });
      }
    });
  }
}