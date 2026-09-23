import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AddSeverityComponent } from './add-severity/add-severity.component';
import { AlertService } from 'src/app/shared/alert.service'; // Adjust path
import { SetupService } from 'src/app/pages/setup/setup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-severity-master',
  templateUrl: './severity-master.component.html',
  styleUrls: ['./severity-master.component.scss']
})
export class SeverityMasterComponent implements OnInit {

  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  allSeverities: any[] = [];
  filteredSeverities: any[] = [];

  showFilters: boolean = false;
  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private api: SetupService,
    private alertService: AlertService
  ) {
    this.filterForm = this.fb.group({
      severityName: [''],
      rating: [null],
      status: [null]
    });
  }

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 46;
  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.loadData();

  }

  loadData() {
    this.api.getSeverities().subscribe((res: any) => {

      if (res.success) {

        this.allSeverities = res.data.sort(
          (a: any, b: any) => a.severityId - b.severityId
        );

        this.filteredSeverities = [...this.allSeverities];

        this.applyFilter();
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilter() {
    const filters = this.filterForm.value;

    this.filteredSeverities = this.allSeverities.filter(severity => {
      let matchesName = true;
      let matchesRating = true;
      let matchesStatus = true;

      if (filters.severityName) {
        matchesName = severity.severityName.toLowerCase().includes(filters.severityName.toLowerCase());
      }

      if (filters.rating) {
        matchesRating = severity.rating.toString().includes(filters.rating.toString());
      }

      if (filters.status !== null && filters.status !== undefined && filters.status !== '') {
        matchesStatus = severity.isActive === filters.status;
      }

      return matchesName && matchesRating && matchesStatus;
    });
  }

  clearFilter() {
    this.filterForm.reset();
    this.filteredSeverities = [...this.allSeverities];
  }

  addSeverity(data: any) {
    const dialogRef = this.dialog.open(AddSeverityComponent, {
      width: '600px',
      height: 'auto',
      data: {
        item: data,
        allSeverities: this.allSeverities
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData(); // Refresh the grid
      }
    });
  }

  toggleStatus(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleSeverityStatus({ severityId: item.severityId }).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message || 'Status toggled successfully', 1);
              // Not strictly necessary to reload data if we manually toggle isActive, but we can
              // this.loadData();
            } else {
              this.alertService.createAlert(res.message || 'Failed to toggle status', 0);
            }
          },
          error: (err: any) => {
            this.alertService.createAlert(err.error?.message || 'An error occurred.', 0);
          }
        });
      }
    });
  }

  deleteRecord(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      data: { title: 'Delete Confirmation', content: `Are you sure you want to delete "${item.severityName}"?`, isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteSeverity({ severityId: item.severityId }).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              this.alertService.createAlert(res.message || 'Severity deleted successfully', 1);
              this.loadData();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete severity', 0);
            }
          },
          error: (err: any) => {
            this.alertService.createAlert(err.error?.message || 'An error occurred while deleting.', 0);
          }
        });
      }
    });
  }

  // saveSeverity(item: any): void {

  //   if (!item.severityName || item.severityName.trim() === '') {
  //     this.alertService.createAlert('Please enter Severity Name', 0);
  //     return;
  //   }

  //   if (item.rating === null || item.rating === undefined || item.rating === '') {
  //     this.alertService.createAlert('Please enter Rating', 0);
  //     return;
  //   }

  //   const payload = {
  //     severityId: item.severityId || 0,
  //     severityName: item.severityName.trim(),
  //     rating: item.rating,
  //     isActive: item.isActive ?? true
  //   };

  //   this.api.upsertSeverity(payload).subscribe({
  //     next: (res: any) => {

  //       if (res && res.success) {

  //         this.alertService.createAlert(
  //           res.message || 'Severity saved successfully',
  //           1
  //         );

  //         this.loadData();

  //       } else {

  //         this.alertService.createAlert(
  //           res.message || 'Failed to save severity',
  //           0
  //         );

  //       }
  //     },

  //     error: (err: any) => {

  //       this.alertService.createAlert(
  //         err.error?.message || 'An error occurred while saving.',
  //         0
  //       );

  //     }
  //   });
  // }
  saveSeverity(item: any): void {

    if (!item.severityName || item.severityName.trim() === '') {
      this.alertService.createAlert('Please enter Severity Name', 0);
      return;
    }

    if (item.rating === null || item.rating === undefined || item.rating === '') {
      this.alertService.createAlert('Please enter Rating', 0);
      return;
    }

    const currentUserId = Number(localStorage.getItem('UserId')) || 1;

    const payload = {
      severityId: item.severityId || 0,
      severityName: item.severityName.trim(),
      rating: item.rating,
      isActive: item.isActive ?? true,
      createdBy: currentUserId,
      modifiedBy: currentUserId
    };

    this.api.upsertSeverity(payload).subscribe({
      next: (res: any) => {

        if (res && res.success) {

          this.alertService.createAlert(
            res.message || 'Severity saved successfully',
            1
          );

          this.loadData();

        } else {

          this.alertService.createAlert(
            res.message || 'Failed to save severity',
            0
          );

        }
      },

      error: (err: any) => {

        this.alertService.createAlert(
          err.error?.message || 'An error occurred while saving.',
          0
        );

      }
    });
  }

}