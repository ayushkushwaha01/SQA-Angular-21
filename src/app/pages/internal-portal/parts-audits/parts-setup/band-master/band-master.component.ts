import { AlertService } from 'src/app/shared/alert.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';


export interface VendorRating {
  id: number;
  ratings: string;
  processAuditMinScore: number;
  processAuditMaxScore: number;
  partsAuditMinScore: number;
  partsAuditMaxScore: number;
}

@Component({
  standalone: false,
  selector: 'app-band-master',
  templateUrl: './band-master.component.html',
  styleUrls: ['./band-master.component.scss']
})
export class BandMasterComponent implements OnInit {

  originalData: VendorRating[] = [];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 47;



  constructor(
    private dialog: MatDialog,
    private setupService: SetupService,
    private AlertService: AlertService
  ) { }

  tableData: any[] = [];

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

    this.getBandMaster();

  }

  getBandMaster() {

    this.setupService.getBandMaster({})
      .subscribe((res: any) => {

        if (res.success) {

          this.tableData = res.data.data;

        }

      });

  }

  saveBand(item: any) {

    const payload = {
      ...item,
      min: item.min.toString(),
      max: item.max.toString(),
      description: item.description || ''
    };

    this.setupService.upsertBandMaster(payload)
      .subscribe((res: any) => {

        if (res.success) {
          this.AlertService.createAlert(res.message, 1);
          this.getBandMaster();
        }
        else {
          this.AlertService.createAlert(res.message, 0);
        }

      });

  }

}
