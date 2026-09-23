import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ManageUsersService } from '../../manage-users.service';

@Component({
  selector: 'app-manager-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './manager-dialog.component.html'
})
export class ManagerDialogComponent implements OnInit {
  assignedManagers: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // data contains the comma-separated manager IDs e.g. "1,4"
    private api: ManageUsersService
  ) { }

  ngOnInit() {
    if (this.data) {
      const selectedIds = this.data.split(',').map(Number);
      
      this.api.getManagers().subscribe((res: any) => {
        if (res.success) {
          // Filter the total list of managers to only show the ones assigned to this user
          this.assignedManagers = res.data.filter((m: any) => selectedIds.includes(m.userId));
        }
      });
    }
  }
}