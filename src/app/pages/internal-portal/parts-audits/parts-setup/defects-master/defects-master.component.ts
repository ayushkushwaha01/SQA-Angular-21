import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddDefectsPopComponent } from './add-defects-pop/add-defects-pop.component';
import { MatTableDataSource } from '@angular/material/table';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from 'src/app/shared/alert.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-defects-master',
  templateUrl: './defects-master.component.html',
  styleUrls: ['./defects-master.component.scss']
})
export class DefectsMasterComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  allData: any[] = [];
  showFilters: boolean = false;
  keyword: string = '';
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;

  readonly SCREEN_ID: number = 36;

  constructor(
    private dialog: MatDialog,
    private api: SetupService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {


    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

    this.loadData();
  }

  loadData() {
    this.api.getDefects().subscribe((res: any) => {
      if (res.success) {
        this.allData = res.data;
        this.dataSource.data = this.allData;
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  filterData() {
    const key = this.keyword.toLowerCase();
    this.dataSource.data = this.allData.filter(x =>
      x.defectName.toLowerCase().includes(key)
    );
  }

  clearFilter() {
    this.keyword = '';
    this.dataSource.data = this.allData;
  }

  adddefects(data: any) {
    let dialogRef = this.dialog.open(AddDefectsPopComponent, {
      width: '600px',
      height: 'auto',
      data: data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData(); // Refresh grid on save
      }
    });
  }

  openEditDialog(item: any) {
    this.adddefects(item);
  }

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      data: {
        title: 'Delete Confirmation',
        content: 'Are you sure you want to delete this Item?',
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteDefect({ defectId: item.defectId }).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Defect deleted successfully', 1);
              this.loadData(); // Refresh grid after delete
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete defect', 0);
            }
          },
          error: (err: any) => {
            this.alertService.createAlert(err.error?.message || 'Error deleting defect', 0);
          }
        });
      }
    });
  }
}