import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
import { PartAuditService } from '../../../part-audit.service';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';

@Component({
  standalone: false,
  selector: 'app-parts-add-parameter',
  templateUrl: './parts-add-parameter.component.html',
  styleUrls: ['./parts-add-parameter.component.scss']
})
export class PartsAddParameterComponent implements OnInit {

  addStep = 1;
  isEditMode: boolean = false;
  localData: any = {}; // Holds the form data

  myGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PartsAddParameterComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _setupService: SetupService,
    private alertService: AlertService, private partauditservice: PartAuditService, private lookupService: LookupService
  ) { }

  ngOnInit(): void {
    console.log('Received data:', this.data);
    this.formInit(this.data);
    this.getLookups();
  }

  formInit(data: any) {

    this.myGroup = this.fb.group({

      AuditParameterId: [data?.auditParameterId || 0],

      PartAuditId: [data?.partAuditId || 0],

      ParameterId: [data?.parameterId || 0],

      PartMasterId: [data?.partMasterId || 0],

      PartFamilyId: [data?.partFamilyId || 0],

      PartId: [
        data?.partId || null,
        Validators.required
      ],

      ParmeterName: [
        data?.parmeterName || '',
        Validators.required
      ],

      Spec: [data?.spec || ''],

      // Min: [data?.min || ''],

      // Max: [data?.max || ''],
      Min: [
        data?.min || '',
        [Validators.pattern(/^\d+(\.\d+)?$/)]
      ],

      Max: [
        data?.max || '',
        [Validators.pattern(/^\d+(\.\d+)?$/)]
      ],

      Method: [data?.method || ''],

      S1: [data?.s1 || ''],

      S2: [data?.s2 || ''],

      S3: [data?.s3 || ''],

      S4: [data?.s4 || ''],

      S5: [data?.s5 || ''],

      Remarks: [data?.remarks || ''],

      Okay: [data?.okay || false],
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

    const payload = {
      ...this.myGroup.value,

      Min: this.myGroup.value.Min != null ? this.myGroup.value.Min.toString() : '',
      Max: this.myGroup.value.Max != null ? this.myGroup.value.Max.toString() : '',

      S1: this.myGroup.value.S1 != null ? this.myGroup.value.S1.toString() : '',
      S2: this.myGroup.value.S2 != null ? this.myGroup.value.S2.toString() : '',
      S3: this.myGroup.value.S3 != null ? this.myGroup.value.S3.toString() : '',
      S4: this.myGroup.value.S4 != null ? this.myGroup.value.S4.toString() : '',
      S5: this.myGroup.value.S5 != null ? this.myGroup.value.S5.toString() : ''
    };

    console.log(payload);
    console.log(typeof payload.S1);

    this.partauditservice.upsertPartAuditParameter(payload)
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
  close() {
    this.dialogRef.close();
  }

  changeAddStep(value: any) {
    this.addStep = value;
  }

  save() {
    // Pass the filled/updated localData back to the parent component
    this.dialogRef.close(this.localData);
  }
}