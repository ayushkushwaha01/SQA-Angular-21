import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
 import { AlertService } from 'src/app/shared/alert.service'; // Adjust path

@Component({
  standalone: false,
  selector: 'app-add-severity',
  templateUrl: './add-severity.component.html',
  styleUrls: ['./add-severity.component.scss']
})
export class AddSeverityComponent implements OnInit {

  severityForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AddSeverityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private api: SetupService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const item = this.data?.item;
    
    this.severityForm = this.fb.group({
      severityId: [item ? item.severityId : 0],
      severityName: [item ? item.severityName : '', Validators.required], 
      rating: [item ? item.rating : null, [Validators.required, Validators.min(1), Validators.max(10)]],
      isActive: [item ? item.isActive : true] 
    });

    if (item && item.severityId) {
       this.isEditMode = true;
    }
  }

  save(): void {
    if (this.severityForm.invalid) {
      this.severityForm.markAllAsTouched();
      return;
    }

    const payload = {
        ...this.severityForm.value,
        severityName: this.severityForm.value.severityName.trim()
    };
    
    const allSeverities = this.data?.allSeverities || [];
    const isDuplicateRating = allSeverities.some((s: any) => 
      s.rating == payload.rating && s.severityId !== payload.severityId
    );

    if (isDuplicateRating) {
      this.alertService.createAlert('A Severity with this rating already exists. Ratings must be unique.', 0);
      return;
    }

    const isDuplicateName = allSeverities.some((s: any) => 
      s.severityName.toLowerCase() === payload.severityName.toLowerCase() && s.severityId !== payload.severityId
    );

    if (isDuplicateName) {
      this.alertService.createAlert('A Severity with this name already exists. Names must be unique.', 0);
      return;
    }
    
    // Call the real API
    this.api.upsertSeverity(payload).subscribe({
      next: (res: any) => {
        if(res.success) {
          this.alertService.createAlert(res.message, 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message, 0);
        }
      },
      error: () => this.alertService.createAlert('Error saving severity', 0)
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}