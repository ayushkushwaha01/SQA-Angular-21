import { Component, OnInit } from '@angular/core';
import { AddStateComponent } from './add-state/add-state.component';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-state-master',
  templateUrl: './state-master.component.html',
  styleUrls: ['./state-master.component.scss']
})
export class StateMasterComponent implements OnInit {

  statesList: any[] = [];
  filteredStates: any[] = [];
  showFilters: boolean = false;
  filterForm: FormGroup;

  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 44;


  constructor(
    private dialog: MatDialog,
    private setupservice: SetupService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.filterForm = this.fb.group({
      keyword: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.getAllStates();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.clearFilter();
    }
  }

  getAllStates() {
    this.setupservice.getAllStates().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.statesList = res.data;
          this.filteredStates = [...this.statesList];
        } else {
          this.alertService.createAlert(res.message || 'Failed to load states');
        }
      },
      error: (err) => {
        console.error('Error fetching states', err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while fetching states.');
      }
    });
  }

  deleteState(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      data: { title: 'Delete Confirmation', content: `Are you sure you want to delete "${item.stateName}"?`, isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.setupservice.deleteState(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'State deleted successfully', 1);
              this.getAllStates();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete state', 0);
            }
          },
          error: (err) => {
            console.error('Error deleting state', err);
            this.alertService.createAlert(err.error?.message || 'An error occurred while deleting the state.', 0);
          }
        });
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
        this.setupservice.toggleStatus(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message || 'Status updated successfully', 1);
            } else {
              this.alertService.createAlert(res.message || 'Failed to update status', 0);
            }
          },
          error: (err) => {
            console.error('Error toggling status', err);
            this.alertService.createAlert(err.error?.message || 'An error occurred while updating the status.', 0);
          }
        });
      }
    });
  }

  applyFilter() {
    const keyword = this.filterForm.get('keyword')?.value?.toLowerCase().trim() || '';
    const status = this.filterForm.get('status')?.value;

    this.filteredStates = this.statesList.filter(item => {
      const matchesKeyword = item.stateName?.toLowerCase().includes(keyword);

      let matchesStatus = true;
      if (status === true || status === false) {
        matchesStatus = item.isActive === status;
      }

      return matchesKeyword && matchesStatus;
    });
  }

  clearFilter() {
    this.filterForm.reset({
      keyword: '',
      status: ''
    });
    this.filteredStates = [...this.statesList];
  }

  addState(data: any) {
    const dialogRef = this.dialog.open(AddStateComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllStates();
      }
    });
  }
}