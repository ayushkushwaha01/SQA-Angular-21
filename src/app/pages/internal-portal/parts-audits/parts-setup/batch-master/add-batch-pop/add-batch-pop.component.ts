import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-add-batch-pop',
  templateUrl: './add-batch-pop.component.html',
  styleUrls: ['./add-batch-pop.component.scss']
})
export class AddBatchPopComponent implements OnInit {


  myGroup!: FormGroup;

  partFamilyId!: number;
  constructor(
    private dialogRef: MatDialogRef<AddBatchPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.formInit(this.data);

    this.getPartsFamilies();
    this.getPartsMasters();
  }


  partsFamilies: any[] = [];
  getPartsFamilies() {
    const userId = localStorage.getItem('UserId');
    const payload = {
      UserId: userId ? Number(userId) : null
    };
    this._setupService.getPartFamilies(payload)
      .subscribe((res: any) => {
        if (res.success) {

          this.partsFamilies = res.data.data;

        }
      });
  }


  partsMasters: any[] = [];
  getPartsMasters() {
    const userId = localStorage.getItem('UserId');
    const payload = {
      UserId: userId ? Number(userId) : null
    };
    this._setupService.getPartMaster(payload)
      .subscribe((res: any) => {
        if (res.success) {

          this.partsMasters = res.data.data;

        }
      });
  }




  formInit(data: any) {

    this.myGroup = this.fb.group({

      BatchId: [
        data?.batchId || 0
      ],

      PartFamilyId: [
        data?.partFamilyId || null,
        Validators.required
      ],

      PartMasterId: [
        data?.partMasterId || null,
        Validators.required
      ],

      BatchNumber: [
        data?.batchNumber || '',
        Validators.required
      ],

      BatchDate: [
        data?.batchDate || '',

      ],

      Remakrs: [
        data?.remakrs || ''
      ]

    });
  }

  get f() {
    return this.myGroup.controls;
  }


  UpsertBatchMaster(): void {

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }
    const userId = localStorage.getItem('UserId');
    const paylaod = {
      ...this.myGroup.value,
      UserId: userId ? Number(userId) : null
    };

    this._setupService
      .upsertBatchMaster(paylaod)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true);

          } else {

            this.alertService.createAlert(res.message, 0);

          }

        },

        error: (err) => {

          console.error(err);
          this.alertService.createAlert('Something went wrong.', 0);

        }

      });

  }


  close(): void {
    this.dialogRef.close();
  }

}