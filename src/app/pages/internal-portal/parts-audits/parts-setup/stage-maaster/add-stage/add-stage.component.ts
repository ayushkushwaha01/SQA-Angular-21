import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from "@angular/material/dialog";
import { SetupService } from "src/app/pages/setup/setup.service";
import { AlertService } from 'src/app/shared/alert.service'; 
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-add-stage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIcon, MatButton, MatDialogActions],
  templateUrl: './add-stage.component.html',
  styleUrl: './add-stage.component.scss',
})
export class AddStageComponent implements OnInit {

  stateForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private setupservice: SetupService,
    private dialogRef: MatDialogRef<AddStageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alertService: AlertService 
  ) {}

  ngOnInit(): void {
    this.stateForm = this.fb.group({
      stageId: [0],
      stageName: ['', [Validators.required, this.noWhitespaceValidator]],
      isActive: [true],
      createdBy: [0], 
      modifiedBy: [0], 
      deletedBy: [0],  
      isDeleted: [false] 
    });

    if (this.data) {
      this.isEditMode = true;
      this.stateForm.patchValue({
        stageId: this.data.stageId,
        stageName: this.data.stageName,
        isActive: this.data.isActive !== undefined ? this.data.isActive : true,
        createdBy: this.data.createdBy || 0,
        modifiedBy: this.data.modifiedBy || 0,
        deletedBy: this.data.deletedBy || 0,
        isDeleted: this.data.isDeleted || false
      });
    }
  }

  noWhitespaceValidator(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { 'required': true } : null;
  }

  onlyAlphabets(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode !== 32 && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  save(): void {
    if (this.stateForm.invalid) {
      this.stateForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.stateForm.value,
      stageName: this.stateForm.value.stageName.trim(),
    };

    this.setupservice.upsertStage(payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.alertService.createAlert(res.message, 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message || "Something went wrong", 0);
        }
      },
      error: (err) => this.alertService.createAlert(err.error?.message || 'Server Error', 0)
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}