import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-add-parameterforpartmaster',
  templateUrl: './add-parameterforpartmaster.component.html',
  styleUrls: ['./add-parameterforpartmaster.component.scss']
})
export class AddParameterforpartmasterComponent implements OnInit {

  isEditMode: boolean = false;

  isDragOver = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  myGroup!: FormGroup;

  partMasterId!: number;
  constructor(
    private dialogRef: MatDialogRef<AddParameterforpartmasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
    private lookupService: LookupService
  ) { }

  ngOnInit(): void {
    this.partMasterId = this.data.partMasterId;
    console.log(this.partMasterId);
    this.formInit(this.data);
    this.getLookups();
    this.getPartAuditCategories();

  }


  formInit(data: any) {
    this.myGroup = this.fb.group({

      ParameterId: [data?.parameterId || 0],
      partMasterId: [data?.partMasterId || 0],

      PartId: [
        data?.partId || null,
        Validators.required
      ],

      ParmeterName: [
        data?.parmeterName || '',
        Validators.required
      ],

      Spec: [
        data?.spec || ''
      ],

      // Min: [
      //   data?.min || ''
      // ],

      // Max: [
      //   data?.max || ''
      // ],
      Min: [
        data?.min || '',
        [Validators.pattern(/^\d+(\.\d+)?$/)]
      ],

      Max: [
        data?.max || '',
        [Validators.pattern(/^\d+(\.\d+)?$/)]
      ],

      Method: [
        data?.method || ''
      ],
      UnitId: [
        data?.unitId || null,
        Validators.required
      ]

    });
  }

  get f() {
    return this.myGroup.controls;
  }

  allowNumericOnly(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    const char = event.key;

    // Allow digits
    if (/[0-9]/.test(char)) {
      return true;
    }

    // Allow one decimal point
    if (char === '.' && !input.value.includes('.')) {
      return true;
    }

    // Allow control keys
    if (
      char === 'Backspace' ||
      char === 'Delete' ||
      char === 'ArrowLeft' ||
      char === 'ArrowRight' ||
      char === 'Tab'
    ) {
      return true;
    }

    event.preventDefault();
    return false;
  }

  lookups: any[] = [];

  getLookups() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.lookups = res.data.filter((x: any) => x.codeId === 3);
      }
    });
  }


  UpsertParameter(): void {

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }

    this._setupService.upsertParameter(this.myGroup.value)
      .subscribe({
        next: (res: any) => {

          if (res.success) {
            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true);
          }
          else {
            this.alertService.createAlert(res.message, 0);
          }

        },
        error: (err) => {
          console.error(err);
          this.alertService.createAlert(
            err?.error?.message || 'Something went wrong.',
            0
          );
        }
      });
  }



  partAuditCategories: any[] = [];
  getPartAuditCategories() {
    this._setupService.getPartAuditCategories(null)
      .subscribe((res: any) => {
        if (res.success) {

          this.partAuditCategories = res.data.data;

        }
      });
  }



  close(): void {
    this.dialogRef.close();
  }


}

