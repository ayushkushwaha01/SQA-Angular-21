import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProcessAuditService } from '../../process-audit.service';

@Component({
  standalone: false,
  selector: 'app-add-process-category-pop',
  templateUrl: './add-process-category-pop.component.html'
})
export class AddProcessCategoryPopComponent implements OnInit {
  isEditMode: boolean = false;
  categoryId: number = 0;
  categoryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProcessCategoryPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ProcessAuditService
  ) {
    // 1. Initialize the Reactive Form
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      categoryCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.categoryId = this.data.processCategoryId;
      
      // 2. Patch values if in Edit Mode
      this.categoryForm.patchValue({
        categoryName: this.data.name,
        categoryCode: this.data.code
      });
    }
  }

  save(): void {
    if (this.categoryForm.valid) {
      const payload = {
        processCategoryId: this.categoryId,
        name: this.categoryForm.value.categoryName,
        code: this.categoryForm.value.categoryCode
      };

      this.api.upsertCategory(payload).subscribe((res: any) => {
        if(res.success) {
          this.dialogRef.close(true);
        }
      });
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}