import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-demerit-master',
  templateUrl: './demerit-master.component.html',
  styleUrls: ['./demerit-master.component.scss']
})
export class DemeritMasterComponent implements OnInit {

  //originalData: VendorRating[] = [];

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 37;

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

    this.getDemeritMaster();

  }

  getDemeritMaster() {

    this.setupService.getDemeritMaster({})
      .subscribe((res: any) => {

        if (res.success) {

          this.tableData = res.data.data;

        }

      });

  }

  saveDemerit(item: any) {

    const payload = {
      ...item,
      demerit: item.demerit != null
        ? Number(item.demerit)
        : null,
      description: item.description || ''
    };

    this.setupService.upsertDemeritMaster(payload)
      .subscribe((res: any) => {

        if (res.success) {

          this.AlertService.createAlert(
            res.message,
            1
          );

          this.getDemeritMaster();

        } else {

          this.AlertService.createAlert(
            res.message,
            0
          );

        }

      });
  }
}
