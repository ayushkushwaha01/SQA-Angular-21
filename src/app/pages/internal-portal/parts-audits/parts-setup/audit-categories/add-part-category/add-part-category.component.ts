import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-add-part-category',
  templateUrl: './add-part-category.component.html',
  styleUrls: ['./add-part-category.component.scss']
})
export class AddPartCategoryComponent implements OnInit {

  isEditMode: boolean = false;

  isDragOver = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  myGroup!: FormGroup;



  constructor(
    public _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddPartCategoryComponent>,
    private _setupService: SetupService, private alertService: AlertService) {
  }


  ngOnInit() {
    console.log('Received data in AddPartCategoryComponent:', this.data);
    if (this.data) {
      this.formInit(this.data);
    }
    else {
      this.formInit(null);
    }
  }

  formInit(data: any) {
    this.myGroup = this._fb.group({
      PartId: new FormControl(data?.partId || 0),

      CategoryName: new FormControl(
        data?.categoryName || '',
        Validators.required
      ),

      CategoryCode: new FormControl(
        data?.categoryCode?.toUpperCase() || '',
        [
          Validators.required,
          Validators.pattern('^[A-Z0-9]{1,5}$')
        ]
      )
    });
  }
  get f() { return this.myGroup.controls }
  onCategoryCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upperValue = input.value.toUpperCase();
    this.myGroup.get('CategoryCode')?.setValue(upperValue, { emitEvent: false });
  }

  UpsertPartAuditCategory() {

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }
    const userId = localStorage.getItem('UserId');
    const paylaod = {
      ...this.myGroup.value,
      UserId: userId ? Number(userId) : null
    };

    this._setupService.upsertPartAuditCategory(paylaod)
      .subscribe({
        next: (data: any) => {
          if (data.success) {
            this.alertService.createAlert(data.message, 1);
            this.dialogRef.close(true);
          } else {
            this.alertService.createAlert(data.message, 0);
          }
        },
        error: (err: HttpErrorResponse) => {
          const message = err.error?.message || 'Something went wrong';
          this.alertService.createAlert(message, 0);
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (!this.selectedFile) {
      console.warn('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    console.log('Saving with file:', this.selectedFile.name);

    this.dialogRef.close({ file: this.selectedFile });
  }

}