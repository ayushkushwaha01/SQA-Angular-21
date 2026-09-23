import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommodityService } from '../../commodity.service';

@Component({
  standalone: false,
  selector: 'app-add-target-pop',
  templateUrl: './add-target-pop.component.html'
})
export class AddTargetPopComponent implements OnInit {
  isEditMode: boolean = false;
  targetId: number = 0;
  commodityId: number = 0;
  auditType: string = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTargetPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: CommodityService
  ) {
    // Limits numbers to 0-100
    this.form = this.fb.group({
      targetYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      q1: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      q2: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      q3: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      q4: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.commodityId = this.data.commodityId;
    this.auditType = this.data.auditType; // Assigns it to 'process' or 'parts'

    if (this.data.item) {
      this.isEditMode = true;
      this.targetId = this.data.item.targetId;
      this.form.patchValue(this.data.item);
    }
  }

  save(): void {
    if (this.form.valid) {
      const payload = {
        targetId: this.targetId,
        commodityId: this.commodityId,
        auditType: this.auditType,
        targetYear: this.form.value.targetYear,
        q1: this.form.value.q1,
        q2: this.form.value.q2,
        q3: this.form.value.q3,
        q4: this.form.value.q4
      };
      
      this.api.upsertTarget(payload).subscribe((res: any) => {
        if(res.success) this.dialogRef.close(true);
      });
    } else { this.form.markAllAsTouched(); }
  }

  close(): void { this.dialogRef.close(false); }
}