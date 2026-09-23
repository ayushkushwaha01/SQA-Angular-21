import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

import { AlertService } from 'src/app/shared/alert.service';
import { ManageUsersService } from '../manage-users/manage-users.service';
import { UserPermissionService } from '../helpers/user-permission.service';

@Component({
  selector: 'app-escalation-matrix',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FlexLayoutModule
  ],
  templateUrl: './escalation-matrix.component.html',
  styleUrl: './escalation-matrix.component.scss',
})
export class EscalationMatrixComponent implements OnInit {
  isRunningEscalations: boolean = false;
  values: any[] = [];
  canUpdate: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 9;

  constructor(
    private alertService: AlertService,
    private manageUsersService: ManageUsersService
  ) { }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID) || UserPermissionService.fnGetReadPermissions('Escalation Matrix');
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetUpdatePermissions('Escalation Matrix');

    if (this.canRead) {
      this.getEscalations();
    }
  }

  // Get Escalations
  getEscalations(): void {
    this.manageUsersService.getEscalation().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.values = res.data || [];
          // If NewValue is null, initially show PreviousValue
          this.values.forEach((item: any) => {
            item.newValue = item.newValue ?? item.previousValue;
          });
        } else {
          this.alertService.createAlert(
            res ? res.message : 'Failed to load escalations'
          );
        }
      },
      error: (err: any) => {
        console.error('Get Escalations Error:', err);
        this.alertService.createAlert('Failed to load escalations');
      }
    });
  }

  saveEscalation(item: any) {
    if (item.newValue === null || item.newValue === undefined || item.newValue.toString().trim() === '') {
      this.alertService.createAlert(`Please enter revised value for ${item.escalationName}`, 0);
      return;
    }

    const payload = {
      escalationId: item.escalationId,
      escalationName: item.escalationName,
      description: item.description,
      previousValue: item.previousValue,
      newValue: item.newValue,
      isActive: item.isActive ?? true,
      modifiedBy: parseInt(localStorage.getItem('UserId') || '1', 10)
    };

    this.manageUsersService.upsertEscalation(payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.alertService.createAlert("Escalation Matrix Updated Successfully", 1);
          item.previousValue = item.newValue;
          this.getEscalations();
        } else {
          this.alertService.createAlert(res ? res.message : "Failed to update", 0);
        }
      },
      error: (err: any) => {
        console.error(err);
        this.alertService.createAlert("An error occurred", 0);
      }
    });
  }

  runEscalationsNow(): void {
    this.isRunningEscalations = true;

    this.manageUsersService.triggerDailyEscalations().subscribe({
      next: (res: any) => {
        this.isRunningEscalations = false;
        if (res && res.success) {
          this.alertService.createAlert(res.message || 'Escalations executed successfully.', 1);
        } else {
          this.alertService.createAlert(res ? res.message : 'Failed to run escalations', 0);
        }
      },
      error: (err: any) => {
        this.isRunningEscalations = false;
        console.error('Trigger Escalation Error:', err);
        this.alertService.createAlert('Error connecting to server to run escalations.', 0);
      }
    });
  }
}
