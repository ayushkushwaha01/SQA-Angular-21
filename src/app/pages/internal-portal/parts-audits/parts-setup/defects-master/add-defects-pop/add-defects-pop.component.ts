import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
 
@Component({
  standalone: false,
  selector: 'app-add-defects-pop',
  templateUrl: './add-defects-pop.component.html',
  styleUrls: ['./add-defects-pop.component.scss']
})
export class AddDefectsPopComponent implements OnInit {
  form: FormGroup;

  constructor(
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddDefectsPopComponent>,
    private api: SetupService
  ) { 
    this.form = this.fb.group({
      defectId: [this.data ? this.data.defectId : 0],
      defectName: [this.data ? this.data.defectName : null, Validators.required]
    });
  }

  ngOnInit(): void { }

  save(): void {
    if (this.form.valid) {
      this.api.upsertDefect(this.form.value).subscribe((res: any) => {
        if (res.success) {
          this.dialogRef.close(true);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}