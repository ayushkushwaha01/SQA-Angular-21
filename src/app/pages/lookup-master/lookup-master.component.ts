import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { AddLookupComponent } from './add-lookup/add-lookup.component';
import { LookupMasterService } from './lookup-master.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { AlertService } from 'src/app/shared/alert.service';
import { UserPermissionService } from '../helpers/user-permission.service';

@Component({
  selector: 'app-lookup-master',
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
  templateUrl: './lookup-master.component.html',
  styleUrl: './lookup-master.component.scss',
})
export class LookupMasterComponent implements OnInit {

  tableData: any[] = [];
  filteredData: any[] = [];
  pagedData: any[] = [];
  codeMasters: any[] = [];

  // Filter models
  selectedCodeFilter: number | null = null;
  filterKeyword: string = '';
  filterStatus: boolean | null = null;
  filterToggle: boolean = false;

  pageIndex: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 6;

  constructor(
    public dialog: MatDialog,
    private api: LookupMasterService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID) || UserPermissionService.fnGetReadPermissions('Lookup') || UserPermissionService.fnGetReadPermissions('Lookup Options');
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetCreatePermissions('Lookup') || UserPermissionService.fnGetCreatePermissions('Lookup Options');
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetUpdatePermissions('Lookup') || UserPermissionService.fnGetUpdatePermissions('Lookup Options');
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID) || UserPermissionService.fnGetDeletePermissions('Lookup') || UserPermissionService.fnGetDeletePermissions('Lookup Options');
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    if (this.canRead) {
      this.getCodeMasters();
      this.getLookups();
    }
  }

  getCodeMasters() {
    this.api.getCodeMasters().subscribe((res: any) => {
      if (res && res.success) {
        this.codeMasters = res.data || [];
      }
    });
  }

  getLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res && res.success) {
        this.tableData = (res.data || []).sort((a: any, b: any) => (b.lookupId || 0) - (a.lookupId || 0));
        this.applyFilters();
      }
    });
  }

  getCodeName(codeId: number): string {
    const found = this.codeMasters.find(x => x.codeId === codeId);
    return found ? found.codeName : (codeId ? codeId.toString() : '-');
  }

  applyFilters() {
    this.filteredData = this.tableData.filter(item => {
      let matchesKeyword = true;
      if (this.filterKeyword) {
        const kw = this.filterKeyword.toLowerCase();
        const codeName = this.getCodeName(item.codeId).toLowerCase();
        matchesKeyword = (
          (item.lookupName && item.lookupName.toLowerCase().includes(kw)) ||
          codeName.includes(kw)
        );
      }

      let matchesStatus = true;
      if (this.filterStatus !== null && this.filterStatus !== undefined) {
        matchesStatus = item.isActive === this.filterStatus;
      }

      let matchesCode = true;
      if (this.selectedCodeFilter !== null && this.selectedCodeFilter !== undefined) {
        matchesCode = item.codeId === this.selectedCodeFilter;
      }

      return matchesKeyword && matchesStatus && matchesCode;
    });

    this.pageIndex = 0;
    this.updatePage();
  }

  clearFilters() {
    this.filterKeyword = '';
    this.filterStatus = null;
    this.selectedCodeFilter = null;
    this.applyFilters();
  }

  updatePage() {
    const maxPageIndex = Math.max(0, Math.ceil(this.filteredData.length / this.pageSize) - 1);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.filteredData.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  addlookup(item: any) {
    let dialogRef = this.dialog.open(AddLookupComponent, {
      data: { item: item, codeMasters: this.codeMasters },
      width: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.getLookups();
      }
    });
  }

  toggleStatus(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleStatus(item.lookupId).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message || 'Status updated successfully.', 1);
            } else {
              this.alertService.createAlert(res ? res.message : 'Failed to update status.', 0);
            }
          }
        });
      }
    });
  }

  deleteLookup(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this lookup?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteLookup(item.lookupId).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              this.alertService.createAlert(res.message || 'Lookup deleted successfully.', 1);
              this.getLookups();
            } else {
              this.alertService.createAlert(res ? res.message : 'Failed to delete lookup.', 0);
            }
          }
        });
      }
    });
  }
}