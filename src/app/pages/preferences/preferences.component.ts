import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

import { AlertService } from 'src/app/shared/alert.service';
import { ManageUsersService } from '../manage-users/manage-users.service';
import { UserPermissionService } from '../helpers/user-permission.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FlexLayoutModule
  ],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss',
})
export class PreferencesComponent implements OnInit {
  tableList: any[] = [];
  canUpdate: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 7;

  constructor(
    private alertService: AlertService,
    private manageUsersService: ManageUsersService
  ) { }

  ngOnInit(): void {
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetUpdatePermissions('Preferences');
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID) || UserPermissionService.fnGetReadPermissions('Preferences');

    if (this.canRead) {
      this.getPreferences();
    }
  }

  // Get Preferences
  getPreferences(): void {
    this.manageUsersService.getPreferences().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.tableList = res.data || [];
        } else {
          this.alertService.createAlert(
            res ? res.message : 'Failed to load preferences'
          );
        }
      },
      error: (err: any) => {
        console.error('Get Preferences Error:', err);
        this.alertService.createAlert('Failed to load preferences');
      }
    });
  }

  // Save / Update Preference
  savePreference(item: any): void {
    if (!item.newValue || item.newValue.toString().trim() === '') {
      this.alertService.createAlert(
        `Please enter ${item.subject}`,
        0
      );
      return;
    }

    const payload = {
      PreferenceId: item.preferenceId,
      Subject: item.subject,
      Description: item.description,
      PreviousValue: item.previousValue,
      NewValue: item.newValue,
      IsActive: item.isActive ?? true,
      IsDeleted: false,
      ModifiedBy: null
    };

    this.manageUsersService.upsertPreference(payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.alertService.createAlert(
            res.message || 'Preference updated successfully',
            1
          );

          // Update displayed Previous Value
          item.previousValue = item.newValue;

          // Update Grid Length in localStorage immediately
          if (item.subject === 'Grid Length') {
            localStorage.setItem(
              'GridLength',
              item.newValue.toString()
            );

            console.log(
              'Grid Length updated:',
              localStorage.getItem('GridLength')
            );
          }
        } else {
          this.alertService.createAlert(
            res ? res.message : 'Failed to update preference',
            0
          );
        }
      },
      error: (err: any) => {
        console.error('Upsert Preference Error:', err);
        this.alertService.createAlert('Failed to update preference', 0);
      }
    });
  }
}