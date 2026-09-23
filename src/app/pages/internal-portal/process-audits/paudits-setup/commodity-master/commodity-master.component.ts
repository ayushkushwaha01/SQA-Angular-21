import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { AddCommodityPopComponent } from './add-commodity-pop/add-commodity-pop.component';
import { CommodityService } from './commodity.service';
import { AlertService } from '../../../../../shared/alert.service';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from '../../../../../status-change/status-change.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';


@Component({
  standalone: false,
  selector: 'app-commodity-master',
  templateUrl: './commodity-master.component.html',
  styleUrls: ['./commodity-master.component.scss']
})
export class CommodityMasterComponent implements OnInit {
  showFilters: boolean = false;
  tableData: any[] = [];
  originalTableData: any[] = [];
  selectedKeyword: string = '';
  selectedStatus: string = '';
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 32;
  private destroy$ = new Subject<void>();
  constructor(
    private dialog: MatDialog,
    public router: Router,
    private api: CommodityService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.getCommodities();

    // Auto-refresh the outer grid count when navigating back to the master route
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd && this.isMasterRoute()) {
    //     this.getCommodities();
    //   }
    // });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.isMasterRoute()) {
          this.getCommodities();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getCommodities() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) {
        this.originalTableData = res.data;
        this.applyFilter();
      }
    });
  }

  addCommodity(item: any): void {
    const dialogRef = this.dialog.open(AddCommodityPopComponent, {
      width: '650px', disableClose: true, data: item
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.alertService.createAlert(item ? 'Commodity updated successfully.' : 'Commodity added successfully.', 1);
        this.getCommodities();
      }
    });
  }

  toggleStatus(item: any) {
    const dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleCommodityStatus(item.commodityId).subscribe((res: any) => {
          if (res.success) {
            item.isActive = !item.isActive;
            this.alertService.createAlert(res.message || 'Status updated successfully.', 1);
          } else {
            this.alertService.createAlert(res.message || 'Failed to update status.', 0);
          }
        });
      }
    });
  }

  deleteCommodity(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this Commodity?', isConfirmation: true }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteCommodity(item.commodityId).subscribe((res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message || 'Commodity deleted successfully.', 1);
            this.getCommodities();
          } else {
            this.alertService.createAlert(res.message || 'Failed to delete Commodity.', 0);
          }
        });
      }
    });
  }

  toggleFilters(): void { this.showFilters = !this.showFilters; }

  onClear(): void {
    this.selectedKeyword = '';
    this.selectedStatus = '';
    this.applyFilter();
  }

  onGo(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.originalTableData];

    if (this.selectedKeyword) {
      const keyword = this.selectedKeyword.trim().toLowerCase();
      filtered = filtered.filter(item =>
        (item.name && item.name.toLowerCase().includes(keyword)) ||
        (item.code && item.code.toLowerCase().includes(keyword))
      );
    }

    if (this.selectedStatus) {
      const isActiveFilter = this.selectedStatus === 'Active';
      filtered = filtered.filter(item => item.isActive === isActiveFilter);
    }

    this.tableData = filtered;
  }

  isMasterRoute(): boolean { return this.router.url.endsWith('/commodity'); }
}