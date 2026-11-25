import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { AddStageComponent } from './add-stage/add-stage.component';
import { MatCardContent, MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-stage-maaster',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardContent, MatCard, MatIcon, MatSelect, MatOption, MatTooltip, MatButton],
  templateUrl: './stage-maaster.component.html',
  styleUrl: './stage-maaster.component.scss',
})
export class StageMaasterComponent implements OnInit {

  stagesList: any[] = [];
  filteredStages: any[] = [];
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
  
  // Mapped to the new Stage Master screen ID in your database
  readonly SCREEN_ID: number = 50;

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
    this.getAllStages();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.clearFilter();
    }
  }

  isActionDisabled(stageName: string): boolean {
    return stageName === 'Incoming';
  }

  

  getAllStages() {
    this.setupservice.getAllStages().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.stagesList = res.data;
          this.filteredStages = [...this.stagesList];
        } else {
          this.alertService.createAlert(res.message || 'Failed to load stages', 0);
        }
      },
      error: (err) => {
        console.error('Error fetching stages', err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while fetching stages.', 0);
      }
    });
  }

  deleteStage(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      data: { title: 'Delete Confirmation', content: `Are you sure you want to delete "${item.stageName}"?`, isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.setupservice.deleteStage(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Stage deleted successfully', 1);
              this.getAllStages();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete stage', 0);
            }
          },
          error: (err) => {
            console.error('Error deleting stage', err);
            this.alertService.createAlert(err.error?.message || 'An error occurred while deleting the stage.', 0);
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
        this.setupservice.toggleStageStatus(item).subscribe({
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

    this.filteredStages = this.stagesList.filter(item => {
      const matchesKeyword = item.stageName?.toLowerCase().includes(keyword);

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
    this.filteredStages = [...this.stagesList];
  }

  addStage(data: any) {
    const dialogRef = this.dialog.open(AddStageComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllStages();
      }
    });
  }
}