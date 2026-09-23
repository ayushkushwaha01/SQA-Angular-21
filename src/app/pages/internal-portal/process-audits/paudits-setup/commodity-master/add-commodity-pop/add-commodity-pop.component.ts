import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommodityService } from '../commodity.service';
 
@Component({
  standalone: false,
  selector: 'app-add-commodity-pop',
  templateUrl: './add-commodity-pop.component.html'
})
export class AddCommodityPopComponent implements OnInit {
  isEditMode: boolean = false;
  commodityId: number = 0;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCommodityPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: CommodityService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(5)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.commodityId = this.data.commodityId;
      this.form.patchValue({ name: this.data.name, code: this.data.code });
    }
  }

  onCodeInput(event: any): void {
    const inputVal = event.target.value || '';
    const upperVal = inputVal.toUpperCase().slice(0, 5);
    this.form.get('code')?.setValue(upperVal, { emitEvent: false });
    event.target.value = upperVal;
  }

  save(): void {
    if (this.form.valid) {
      const payload = {
        commodityId: this.commodityId,
        name: this.form.value.name,
        code: this.form.value.code
      };
      this.api.upsertCommodity(payload).subscribe((res: any) => {
        if(res.success) this.dialogRef.close(true);
      });
    } else { this.form.markAllAsTouched(); }
  }

  close(): void { this.dialogRef.close(false); }
}