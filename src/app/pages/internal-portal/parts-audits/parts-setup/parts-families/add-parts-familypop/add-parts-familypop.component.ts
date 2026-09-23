import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-add-parts-familypop',
  templateUrl: './add-parts-familypop.component.html',
  styleUrls: ['./add-parts-familypop.component.scss']
})
export class AddPartsFamilypopComponent implements OnInit {

  isEditMode: boolean = false;

  isDragOver = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  myGroup!: FormGroup;



  constructor(
    public _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddPartsFamilypopComponent>,
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
      PartFamilyId: [data?.partFamilyId || 0],

      PartFamilyName: [
        data?.partFamilyName || '',
        Validators.required
      ],

      PartFamilyCode: [
        data?.partFamilyCode?.toUpperCase() || '',
        [
          Validators.required,
          Validators.pattern('^[A-Z0-9]{1,5}$')
        ]
      ]
    });

    console.log(this.myGroup.value);
  }
  get f() { return this.myGroup.controls }

  onUppercaseInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const upperValue = input.value.toUpperCase();
    this.myGroup.get(controlName)?.setValue(upperValue, { emitEvent: false });
  }
  UpsertPartFamily() {

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }
    const userId = localStorage.getItem('UserId');
    const paylaod = {
      ...this.myGroup.value,
      UserId: userId ? Number(userId) : null
    };

    this._setupService.upsertPartFamily(paylaod)
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;

    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    this.selectedFileName = file.name;
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