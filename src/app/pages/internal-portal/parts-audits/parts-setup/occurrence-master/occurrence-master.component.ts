import { Component, OnInit } from '@angular/core';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-occurrence-master',
  templateUrl: './occurrence-master.component.html',
  styleUrls: ['./occurrence-master.component.scss']
})
export class OccurrenceMasterComponent implements OnInit {

  tableData: any[] = [];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 48;


  constructor(
    private setupService: SetupService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.getOccurrences();
  }

  // Get Occurrence Master
  getOccurrences(): void {

    this.setupService.getOccurrence().subscribe({
      next: (res: any) => {

        console.log('Occurrence Response:', res);

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
            res.message || 'Failed to load occurrences',
            0
          );

        }

      },

      error: (err: any) => {

        console.error('Get Occurrences Error:', err);

        this.alertService.createAlert(
          'Failed to load occurrences',
          0
        );

      }
    });

  }

  // Save / Update Occurrence
  saveOccurrence(item: any): void {

    if (
      item.newSubject === null ||
      item.newSubject === undefined ||
      item.newSubject.toString().trim() === ''
    ) {

      this.alertService.createAlert(
        'Please enter Subject',
        0
      );

      return;
    }

    const payload = {

      OccurrenceId: item.occurrenceId,

      Subject: item.subject,

      NewSubject: item.newSubject,

      Rating: item.rating,

      IsActive: item.isActive ?? true,

      IsDeleted: false,

      ModifiedBy: null

    };

    console.log('Occurrence Payload:', payload);

    this.setupService.upsertOccurrence(payload).subscribe({

      next: (res: any) => {

        console.log('Upsert Occurrence Response:', res);

        if (res.success) {

          this.alertService.createAlert(
            res.message || 'Occurrence updated successfully',
            1
          );

          /*
           * After save, the revised Subject becomes
           * the current Subject.
           */
          item.subject = item.newSubject;

          this.getOccurrences();

        } else {

          this.alertService.createAlert(
            res.message || 'Failed to update occurrence',
            0
          );

        }

      },

      error: (err: any) => {

        console.error('Upsert Occurrence Error:', err);

        this.alertService.createAlert(
          'Failed to update occurrence',
          0
        );

      }

    });

  }

}