import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AddUsersComponent } from './add-users/add-users.component';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ManageUsersService } from '../manage-users.service';
import { AlertService } from '../../../shared/alert.service';
import { ManagerDialogComponent } from './manager-dialog/manager-dialog.component';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { StatusChangeComponent } from '../../../status-change/status-change.component';
import { UserPermissionService } from '../../helpers/user-permission.service';
import { MfaSetupDialogComponent } from '../../mfa-setup-dialog/mfa-setup-dialog.component';
import { AuthTokenService } from '../../../../auth-token.service';
import { DeleteDailogComponent } from 'src/app/shared/delete-dailog/delete-dailog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTableModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  canRead: boolean = false;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  readonly SCREEN_ID: number = 3;

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 10;
  filterForm!: FormGroup;
  filterToggle = false;
  allUsersData: any[] = []; // 🔥 Cache master user list for filtering

  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private api: ManageUsersService,
    private alertService: AlertService,
    private authTokenService: AuthTokenService
  ) {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }


  ngOnInit() {
    // 🔥 3. Load Permissions
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

    // Stop loading data if they can't even read
    if (!this.canRead) return;

    const gridLength = localStorage.getItem('GridLength');
    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.getAllUsers();
  }

  getAllUsers() {
    this.api.getAllUsers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.allUsersData = res.data || [];
          this.filter(); // Apply any existing filters or show all if empty
        }
      },
      error: () => this.alertService.createAlert('Error fetching users', 0)
    });
  }

  // openEditDialog(item: any = null) {
  //   let dialogRef = this.dialog.open(EditUserComponent, {
  //     data: item,
  //     height: 'auto',
  //     width: '850px'
  //   });

  //   dialogRef.afterClosed().subscribe(data => {
  //     if (data) {
  //       this.getAllUsers();
  //     }
  //   });
  // }

  isAdminUser(item: any): boolean {
    return !!(item && item.userName && item.userName.toLowerCase() === 'admin');
  }

  openEditDialog(item: any = null) {
    if (!item && !this.canCreate) return; // Block Add
    if (item && (this.isAdminUser(item) || !this.canUpdate)) return; // Block Edit Admin

    let dialogRef = this.dialog.open(AddUsersComponent, {
      data: item,
      height: 'auto',
      width: '850px'
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.getAllUsers();
      }
    });
  }

  // toggleStatus(item: any) {
  //   let dialogRef = this.dialog.open(StatusChangeComponent, {
  //     width: '360px',
  //     panelClass: 'no-padding-dialog',
  //     disableClose: true
  //   });

  //   dialogRef.afterClosed().subscribe((result: any) => {
  //     if (result) {
  //       this.api.toggleUserStatus(item).subscribe({
  //         next: (res: any) => {
  //           if (res.success) {
  //             item.isActive = !item.isActive;
  //             this.alertService.createAlert(res.message, 1);
  //           } else {
  //             this.alertService.createAlert(res.message, 0);
  //           }
  //         }
  //       });
  //     }
  //   });
  // }

  toggleStatus(item: any) {
    if (this.isAdminUser(item) || !this.canUpdate) return; // 🔥 Safety Guard for Admin

    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleUserStatus(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message, 1);
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }


  deleteConfirmation(item: any) {
    if (this.isAdminUser(item) || !this.canDelete) return; // 🔥 Safety Guard for Admin

    let dialogRef = this.dialog.open(DeleteDailogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteUser(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getAllUsers();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  getManagerCount(managerStr: string): number {
    if (!managerStr) return 0;
    return managerStr.split(',').filter(x => x).length;
  }



  openManagersDialog(managerStr: string) {
    if (!managerStr || !this.canUpdate) return; // Do nothing if 0 managers or no access

    this.dialog.open(ManagerDialogComponent, {
      data: managerStr,
      width: '350px'
    });
  }

  openResetPassword(item: any) {
    this.dialog.open(ResetPasswordDialogComponent, {
      data: item, // Pass the whole user so we have the UserId
      width: '550px'
    });
  }

  // toggleRole(item: any) {
  //   this.api.upsertUser(item).subscribe({
  //     next: (res: any) => {
  //       if (res.success) {
  //         this.alertService.createAlert('Role updated successfully', 1);
  //       } else {
  //         this.alertService.createAlert(res.message, 0);
  //         this.getAllUsers(); // Revert on failure
  //       }
  //     },
  //     error: () => {
  //       this.alertService.createAlert('Failed to update role', 0);
  //       this.getAllUsers(); // Revert on error
  //     }
  //   });
  // }

  toggleRole(item: any) {
    if (this.isAdminUser(item) || !this.canUpdate) return; // 🔥 Safety Guard for Admin

    this.api.upsertUser(item).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('Role updated successfully', 1);
        } else {
          this.alertService.createAlert(res.message, 0);
          this.getAllUsers(); // Revert on failure
        }
      },
      error: () => {
        this.alertService.createAlert('Failed to update role', 0);
        this.getAllUsers(); // Revert on error
      }
    });
  }


  // ==========================================================
  // 🔥 SMART MFA CHECKBOX HANDLER
  // ==========================================================
  public onMfaChange(item: any, event: any) {
    if (this.isAdminUser(item) || !this.canUpdate) return;

    // Get the ID of the Admin who is currently clicking the screen
    // const currentLoggedInUserId = localStorage.getItem('UserId');
    const currentLoggedInUserId = this.authTokenService.getUserId();

    // 1. IF TURNING MFA ON
    if (event.checked) {

      // A) If Admin is checking their OWN row -> Show the Popup!
      if (item.userId == currentLoggedInUserId) {
        const dialogRef = this.dialog.open(MfaSetupDialogComponent, {
          width: '450px',
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(verified => {
          if (verified) {
            // Success! They scanned the code and typed the 6 digits. Save to DB.
            this.toggleRole(item);
          } else {
            // They cancelled the popup. Revert the checkbox visually.
            item.isMfaEnabled = false;
          }
        });
      }
      // B) If Admin is checking SOMEONE ELSE's row -> Enforce silently!
      else {
        this.alertService.createAlert(`MFA Enforced for ${item.userName}.`, 1);
        this.toggleRole(item);
      }
    }
    // 2. IF TURNING MFA OFF
    else {
      this.toggleRole(item);
    }
  }

  // ==========================================================
  // 🔥 FILTER METHODS
  // ==========================================================
  filter() {
    const { Keyword, Status } = this.filterForm.value;
    const keywordLower = (Keyword || '').toLowerCase().trim();

    let filtered = this.allUsersData.filter(item => {
      // 1. Keyword filter
      let matchesKeyword = true;
      if (keywordLower) {
        matchesKeyword =
          (item.userName && item.userName.toLowerCase().includes(keywordLower)) ||
          (item.email && item.email.toLowerCase().includes(keywordLower)) ||
          (item.phoneNumber && item.phoneNumber.toLowerCase().includes(keywordLower)) ||
          (item.department && item.department.toLowerCase().includes(keywordLower)) ||
          (item.roleName && item.roleName.toLowerCase().includes(keywordLower));
      }

      // 2. Status filter
      let matchesStatus = true;
      if (Status !== '' && Status !== null && Status !== undefined) {
        const statusBool = Status === true || Status === 'true';
        matchesStatus = item.isActive === statusBool;
      }

      return matchesKeyword && matchesStatus;
    });

    this.dataSource.data = filtered;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  clearFilter() {
    this.filterForm.reset({
      Keyword: '',
      Status: ''
    });
    this.dataSource.data = [...this.allUsersData];
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }
}