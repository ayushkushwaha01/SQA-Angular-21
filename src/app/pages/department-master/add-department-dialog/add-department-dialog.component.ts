import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-add-department-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './add-department-dialog.component.html',
  styleUrl: './add-department-dialog.component.scss',
})
export class AddDepartmentDialogComponent implements OnInit {
  departmentForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddDepartmentDialogComponent>,
    private fb: FormBuilder,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    // Initialize the form. If data was passed, we are in Edit Mode. 
    // If no data, we are in Add Mode and default DepartmentId to 0.
    this.departmentForm = this.fb.group({
      departmentId: [this.data ? this.data.departmentId : 0],
      departmentName: [this.data ? this.data.departmentName : null, Validators.required],
      departmentCode: [this.data ? this.data.departmentCode : null, Validators.required],
      departmentHead: [this.data ? this.data.departmentHead : null]
    });
  }

  saveDepartment() {
    if (this.departmentForm.valid) {
      this.departmentService.addUpdateDepartment(this.departmentForm.value).subscribe((res: any) => {
        if (res && res.success) {
          // Pass 'success' back to the parent to trigger a grid refresh
          this.dialogRef.close('success');
        } else {
          // Handle backend error messages (e.g. "Department already exists")
          alert(res ? res.message : 'Error saving department'); 
        }
      });
    } else {
      this.departmentForm.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
