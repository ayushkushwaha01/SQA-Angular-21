import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

import { PartAuditService } from '../internal-portal/parts-audits/part-audit.service';
import { ManageUsersService } from '../manage-users/manage-users.service';
import { UserPermissionService } from '../helpers/user-permission.service';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTooltipModule,
    FlexLayoutModule
  ],
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.scss']
})
export class EventLogComponent implements OnInit {

  canUpdate: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 8;

  filterForm!: FormGroup;
  filterToggle: boolean = false;

  eventDetails: any[] = [];
  allusers: any[] = [];

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 20;

  tableLists: any[] = [];

  constructor(
    private fb: FormBuilder,
    private manageUsersService: ManageUsersService,
    private partAuditService: PartAuditService
  ) { }

  ngOnInit() {
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetUpdatePermissions('Event Log');
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID) || UserPermissionService.fnGetReadPermissions('Event Log');
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.formInit();

    if (this.canRead) {
      this.getEventLog();
      this.getAllusers();
    }
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      EventType: [''],
      userId: [null],
      FromDate: [null],
      ToDate: [null]
    });
  }

  clearFilter() {
    this.filterForm.reset({
      Keyword: '',
      EventType: '',
      userId: null,
      FromDate: null,
      ToDate: null
    });

    this.getEventLog();
  }

  getEventLog() {
    const filter: any = {
      Keyword: this.filterForm.value.Keyword || '',
      EventType: this.filterForm.value.EventType || ''
    };

    const selectedUserId = this.filterForm.value.userId;

    if (selectedUserId !== null && selectedUserId !== undefined && selectedUserId !== '') {
      filter.UserId = Number(selectedUserId);
    }

    if (this.filterForm.value.FromDate) {
      filter.FromDate = this.filterForm.value.FromDate;
    }

    if (this.filterForm.value.ToDate) {
      filter.ToDate = this.filterForm.value.ToDate;
    }

    this.manageUsersService.getEventLog(filter).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.eventDetails = (res.data && res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
          this.totalSize = (res.data && res.data.totalRecords) ? res.data.totalRecords : this.eventDetails.length;

          this.currentPage = 0;
          this.loadPageData();
        }
      },
      error: (err: any) => {
        console.error('Event log load error', err);
      }
    });
  }

  getAllusers() {
    this.partAuditService.getUserDD().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.allusers = res.data || [];
        }
      },
      error: (err: any) => {
        console.error('Failed to load users dropdown', err);
      }
    });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.eventDetails.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }

  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPageData();
  }
}
