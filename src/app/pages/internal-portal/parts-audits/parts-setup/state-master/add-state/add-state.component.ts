import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SetupService } from "src/app/pages/setup/setup.service";
 import { AlertService } from 'src/app/shared/alert.service'; 

@Component({
  standalone: false,
  selector: "app-add-state",
  templateUrl: "./add-state.component.html",
  styleUrls: ["./add-state.component.scss"],
})
export class AddStateComponent implements OnInit {
  stateForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private setupservice: SetupService,
    private dialogRef: MatDialogRef<AddStateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alertService: AlertService 
  ) {}

  ngOnInit(): void {
    this.stateForm = this.fb.group({
      stateId: [0],
      // Added a custom validator to prevent pure blank spaces from being valid
      stateName: ['', [Validators.required, this.noWhitespaceValidator]],
      isActive: [true],
      createdBy: [0], 
      modifiedBy: [0], 
      deletedBy: [0],  
      isDeleted: [false] 
    });

    if (this.data) {
      this.isEditMode = true;
      this.stateForm.patchValue({
        stateId: this.data.stateId,
        stateName: this.data.stateName,
        isActive: this.data.isActive !== undefined ? this.data.isActive : true,
        createdBy: this.data.createdBy || 0,
        modifiedBy: this.data.modifiedBy || 0,
        deletedBy: this.data.deletedBy || 0,
        isDeleted: this.data.isDeleted || false
      });
    }
  }

  // Custom validator to block empty spaces
  noWhitespaceValidator(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { 'required': true } : null;
  }

  // Method to allow only alphabets and spaces based on your reference HTML
  onlyAlphabets(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow space (32) and alphabetical characters only
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

    // Trim the state name right before saving just to be safe
    const payload = {
      ...this.stateForm.value,
      stateName: this.stateForm.value.stateName.trim(),
    };

    this.setupservice.addState(payload).subscribe({
      next: (res: any) => {
        
        if (res && res.success) {
           this.alertService.createAlert(res.message, 1);
           this.dialogRef.close(true); // Moved INSIDE the success condition
        } else {
           this.alertService.createAlert(res.message || "Something went wrong", 0);
        }
      },
      error: () => this.alertService.createAlert('Server Error', 0)
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}