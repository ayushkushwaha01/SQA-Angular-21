import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LookupMasterService } from '../lookup-master.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-add-lookup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './add-lookup.component.html',
  styleUrl: './add-lookup.component.scss',
})
export class AddLookupComponent implements OnInit {
  isEditMode: boolean = false;
  lookupId: number = 0;
  form: FormGroup;
  codeMasters: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddLookupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: LookupMasterService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      codeId: [null, Validators.required],
      lookupName: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.codeMasters = (this.data && this.data.codeMasters) ? this.data.codeMasters : [];

    if (this.data && this.data.item) {
      this.isEditMode = true;
      this.lookupId = this.data.item.lookupId;
      this.form.patchValue({
        codeId: this.data.item.codeId,
        lookupName: this.data.item.lookupName
      });
    }
  }

  saveLookup() {
    if (this.form.valid) {
      const payload = {
        lookupId: this.lookupId,
        codeId: this.form.value.codeId,
        lookupName: this.form.value.lookupName
      };

      this.api.upsertLookup(payload).subscribe((res: any) => {
        if (res && res.success) {
          const successMessage = res.message || (this.isEditMode ? 'Lookup updated successfully.' : 'Lookup added successfully.');
          this.alertService.createAlert(successMessage, 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res ? res.message : 'Failed to save lookup.', 0);
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