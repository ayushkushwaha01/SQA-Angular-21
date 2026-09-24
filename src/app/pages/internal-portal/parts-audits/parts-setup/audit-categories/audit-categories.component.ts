import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartCategoryComponent } from './add-part-category/add-part-category.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DownloadExcelService } from 'src/app/shared/download-excel.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';

@Component({
  standalone: false,
  selector: 'app-audit-categories',
  templateUrl: './audit-categories.component.html',
  styleUrls: ['./audit-categories.component.scss']
})
export class AuditCategoriesComponent implements OnInit {
  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];

  constructor(private dialog: MatDialog,
    private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
    private downLoadExcelService: DownloadExcelService
  ) { }

  filterForm!: FormGroup;
  filterToggle = false;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 33;

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    this.formInit();
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.getPartAuditCategories();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  showFilters: boolean = false;

  // onClear(): void {
  //   this.selectedCategory = null;
  //   this.selectedStatus = '';
  // }

  // onGo(): void {
  //   console.log('Filters Applied:', { category: this.selectedCategory, status: this.selectedStatus });
  // }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }
  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.getPartAuditCategories();
  }

  addCategory(data: any) {
    const dialogRef = this.dialog.open(AddPartCategoryComponent, {
      width: '650px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPartAuditCategories();   // Reload the grid/list
      }
    });
  }
  partAuditCategories: any[] = [];
  // getPartAuditCategories() {
  //   // const userId = localStorage.getItem('UserId');

  //   const filter = {
  //     ...this.filterForm.value,
  //     UserId: userId ? Number(userId) : null
  //   };
  //   this._setupService.getPartAuditCategories(filter)
  //     .subscribe((res: any) => {
  //       if (res.success) {

  //         this.partAuditCategories = res.data.data;
  //         this.totalSize = res.data.toatalRecords;

  //         this.tableLists = this.partAuditCategories.slice(
  //           this.fromIndex,
  //           this.pageSize
  //         );
  //       }
  //     });
  // }

  getPartAuditCategories() {
    // 🔥 ZERO TRUST: Removed UserId from here entirely!
    const filter = { ...this.filterForm.value };

    // Clean up empty strings so they don't clutter the URL
    Object.keys(filter).forEach(key => {
      if (filter[key] === null || filter[key] === '') {
        delete filter[key];
      }
    });

    this._setupService.getPartAuditCategories(filter)
      .subscribe((res: any) => {
        if (res.success) {
          this.partAuditCategories = res.data.data;
          this.totalSize = res.data.toatalRecords;
          this.tableLists = this.partAuditCategories.slice(this.fromIndex, this.pageSize);
        }
      });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.partAuditCategories.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }
  fnHandlePage(event: any) {

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadPageData();
  }

  // deleteConfirmation(item: any) {

  //   let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: 'auto',
  //     data: {
  //       component: null,
  //       title: 'Delete Confirmation',
  //       content: 'Are you sure you want to Delete?',
  //       isConfirmation: true
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((data: any) => {

  //     if (data) {

  //       const userId = localStorage.getItem('UserId');

  //       const payload = {
  //         ...item,
  //         UserId: userId ? Number(userId) : null
  //       };

  //       console.log('Delete Payload:', payload);

  //       this._setupService.deletePartAuditCategory(payload)
  //         .subscribe({
  //           next: (res: any) => {

  //             if (res.success) {
  //               this.alertService.createAlert(res.message, 1);
  //               this.getPartAuditCategories();
  //             } else {
  //               this.alertService.createAlert(res.message, 0);
  //             }

  //           }
  //         });
  //     }
  //   });
  // }

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        // 🔥 ZERO TRUST: Just pass the item, don't attach UserId
        const payload = { ...item };

        this._setupService.deletePartAuditCategory(payload)
          .subscribe({
            next: (res: any) => {
              if (res.success) {
                this.alertService.createAlert(res.message, 1);
                this.getPartAuditCategories();
              } else {
                this.alertService.createAlert(res.message, 0);
              }
            }
          });
      }
    });
  }


  // changeStatus(item: any) {

  //   let dialogRef = this.dialog.open(DialogComponent, {
  //     width: 'auto',
  //     data: {
  //       component: null,
  //       title: 'Change Status Confirmation',
  //       content: 'Are you sure you want to change the status?',
  //       isConfirmation: true
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((data: any) => {

  //     if (data) {

  //       const userId = localStorage.getItem('UserId');

  //       const payload = {
  //         ...item,
  //         UserId: userId ? Number(userId) : null
  //       };

  //       console.log('Toggle Status Payload:', payload);

  //       this._setupService.ChangeStatus(payload)
  //         .subscribe({
  //           next: (res: any) => {

  //             if (res.success) {
  //               this.alertService.createAlert(res.message, 1);
  //               this.getPartAuditCategories();
  //             } else {
  //               this.alertService.createAlert(res.message, 0);
  //             }

  //           }
  //         });
  //     }
  //   });
  // }



  changeStatus(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      data: { component: null, title: 'Change Status Confirmation', content: 'Are you sure you want to change the status?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        // 🔥 ZERO TRUST: Just pass the item, don't attach UserId
        const payload = { ...item };

        this._setupService.ChangeStatus(payload)
          .subscribe({
            next: (res: any) => {
              if (res.success) {
                this.alertService.createAlert(res.message, 1);
                this.getPartAuditCategories();
              } else {
                this.alertService.createAlert(res.message, 0);
              }
            }
          });
      }
    });
  }

  // --- ADD THIS NEW METHOD ---
  downloadTemplate(): void {
    // 1. Define the headers and sample data for your CSV template
    const csvHeader = "Category Name,Category Code,Status,Parameters\n";
    const csvSampleRow = "Sample Category,SAM001,Active,10\n";
    const csvData = csvHeader + csvSampleRow;

    // 2. Create a Blob from the CSV string
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    // 3. Create a hidden <a> tag to trigger the download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Parts_Audit_Category_Template.csv');
    link.style.display = 'none';

    // 4. Append to body, click it, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  exportAsXLSX(): void {
    if (!this.partAuditCategories || this.partAuditCategories.length === 0) {
      this.alertService.warn('No data available to export.');
      return;
    }

    const excelData = this.partAuditCategories.map((x: any) => ({
      'Category Name': x.categoryName,
      'Category Code': x.categoryCode,
      'Status': x.isActive ? 'Active' : 'Inactive'
    }));

    this.downLoadExcelService.exportAsExcelFile(
      excelData,
      'PartAuditCategories_' + new Date().toLocaleString()
    );
  }

}