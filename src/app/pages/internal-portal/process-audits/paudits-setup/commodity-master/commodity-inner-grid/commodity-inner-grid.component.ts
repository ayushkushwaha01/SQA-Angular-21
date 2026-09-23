import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AddTargetPopComponent } from './add-target-pop/add-target-pop.component';
import { CommodityService } from '../commodity.service';
import { AlertService } from '../../../../../../shared/alert.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
 
@Component({
  standalone: false,
  selector: 'app-commodity-inner-grid',
  templateUrl: './commodity-inner-grid.component.html',
  styleUrls: ['./commodity-inner-grid.component.scss']
})
export class CommodityInnerGridComponent implements OnInit {
  commodityId: number = 0;
  activeTab: 'process' | 'parts' = 'process';
  allTargets: any[] = [];

  constructor(
    private dialog: MatDialog, 
    private location: Location,
    private route: ActivatedRoute,
    private api: CommodityService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.commodityId = Number(params['id']);
      this.loadTargets();
    });
  }

  loadTargets() {
    this.api.getTargets(this.commodityId).subscribe((res: any) => {
      if (res.success) this.allTargets = res.data;
    });
  }

  get currentGridData() {
    return this.allTargets.filter(t => t.auditType === this.activeTab);
  }

  setTab(tab: 'process' | 'parts') { this.activeTab = tab; }

  ontarget(item: any = null): void {
    const dialogRef = this.dialog.open(AddTargetPopComponent, {
      width: '600px',
      // Pass the parent CommodityId and the specific Tab type to the popup
      data: { item: item, commodityId: this.commodityId, auditType: this.activeTab }
    }); 
    dialogRef.afterClosed().subscribe(res => { 
      if (res) {
        this.alertService.createAlert(item ? 'Target updated successfully.' : 'Target added successfully.', 1);
        this.loadTargets(); 
      }
    });
  }

  deleteTarget(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this Target?', isConfirmation: true }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteTarget(item.targetId).subscribe((res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message || 'Target deleted successfully.', 1);
            this.loadTargets();
          } else {
            this.alertService.createAlert(res.message || 'Failed to delete Target.', 0);
          }
        });
      }
    });
  }

  goBack() { this.location.back(); }
}