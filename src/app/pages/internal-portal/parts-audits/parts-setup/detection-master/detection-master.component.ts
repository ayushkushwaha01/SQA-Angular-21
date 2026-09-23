import { Component, OnInit } from '@angular/core';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-detection-master',
  templateUrl: './detection-master.component.html',
  styleUrls: ['./detection-master.component.scss']
})
export class DetectionMasterComponent implements OnInit {

  tableData: any[] = [];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 49;


  constructor(
    private setupService: SetupService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.getDetection();
  }

  // Get Detection Master
  getDetection(): void {

    this.setupService.getDetection().subscribe({
      next: (res: any) => {

        console.log('Detection Response:', res);

        if (res.success) {

          this.tableData = res.data || [];

          /*
           * If NewSubject is NULL,
           * display the existing Subject.
           *
           * If NewSubject already has a value,
           * display that value.
           */
          this.tableData.forEach((item: any) => {

            item.newSubject =
              item.newSubject ?? item.subject;

          });

        } else {

          this.alertService.createAlert(
            res.message || 'Failed to load detections',
            0
          );

        }

      },

      error: (err: any) => {

        console.error('Get Detections Error:', err);

        this.alertService.createAlert(
          'Failed to load detections',
          0
        );

      }
    });

  }

  // Save / Update Detection
  saveDetection(item: any): void {

    if (
      item.subject === null ||
      item.subject === undefined ||
      item.subject.toString().trim() === ''
    ) {

      this.alertService.createAlert(
        'Please enter Subject',
        0
      );

      return;
    }

    const payload = {

      DetectionId: item.detectionId,

      Subject: item.subject,

      NewSubject: null,

      Rating: item.rating,

      IsActive: item.isActive ?? true,

      IsDeleted: false,

      ModifiedBy: null

    };

    console.log('Detection Payload:', payload);

    this.setupService.upsertDetection(payload).subscribe({

      next: (res: any) => {

        console.log('Upsert Detection Response:', res);

        if (res.success) {

          this.alertService.createAlert(
            res.message || 'Detection updated successfully',
            1
          );

          this.getDetection();

        } else {

          this.alertService.createAlert(
            res.message || 'Failed to update detection',
            0
          );

        }

      },

      error: (err: any) => {

        console.error('Upsert Detection Error:', err);

        this.alertService.createAlert(
          'Failed to update detection',
          0
        );

      }

    });

  }

}