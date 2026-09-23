import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { CommodityService } from 'src/app/pages/internal-portal/process-audits/paudits-setup/commodity-master/commodity.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-add-partspop',
  templateUrl: './add-partspop.component.html',
  styleUrls: ['./add-partspop.component.scss']
})
export class AddPartspopComponent implements OnInit {

  isEditMode: boolean = false;

  isDragOver = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<AddPartspopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
    private api: CommodityService,
  ) { }


  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];


  ngOnInit(): void {
    console.log('Received data:', this.data);
    this.formInit(this.data);
    this.getPartsFamilies();
    this.getCommodities();

  }




  partsFamilies: any[] = [];
  // getPartsFamilies() {
  //   const userId = localStorage.getItem('UserId');
  //   const payload = {
  //     UserId: userId ? Number(userId) : null
  //   };
  //   this._setupService.getPartFamilies(payload)
  //     .subscribe((res: any) => {
  //       if (res.success) {

  //         this.partsFamilies = res.data.data;

  //       }
  //     });
  // }

  getPartsFamilies() {
    // 🔥 ZERO TRUST FIX: Do not send UserId
    this._setupService.getPartFamilies({}) // Pass an empty object instead of the payload with UserId
      .subscribe((res: any) => {
        if (res.success) {
          this.partsFamilies = res.data.data;
        }
      });
  }


  originalTableData: any[] = [];
  getCommodities() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) {
        this.originalTableData = res.data;

      }
    });
  }

  myGroup!: FormGroup;

  formInit(data: any) {

    this.myGroup = this.fb.group({

      PartMasterId: [
        data?.partMasterId || 0
      ],

      PartFamilyId: [
        data?.partFamilyId || null,
        Validators.required
      ],

      PartMasterName: [
        data?.partMasterName || '',
        Validators.required
      ],

      PartMasterCode: [
        data?.partMasterCode || '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]{1,5}$')
        ]
      ],

      CommodityId: [
        data?.commodityId || null,
        Validators.required
      ]

    });
  }

  get f() {
    return this.myGroup.controls;
  }


  // UpsertPartMaster(): void {

  //   if (this.myGroup.invalid) {
  //     this.myGroup.markAllAsTouched();
  //     return;
  //   }

  //   const userId = localStorage.getItem('UserId');
  //   const paylaod = {
  //     ...this.myGroup.value,
  //     UserId: userId ? Number(userId) : null
  //   };
  //   this._setupService
  //     .upsertPartMaster(paylaod)
  //     .subscribe({

  //       next: (res: any) => {

  //         if (res.success) {

  //           this.alertService.createAlert(res.message, 1);
  //           this.dialogRef.close(true);

  //         } else {

  //           this.alertService.createAlert(res.message, 0);

  //         }

  //       },

  //       error: (err: HttpErrorResponse) => {

  //         console.error(err);
  //         const message = err.error?.message || 'Something went wrong.';
  //         this.alertService.createAlert(message, 0);

  //       }

  //     });

  // }

  UpsertPartMaster(): void {
    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }

    // 🔥 ZERO TRUST FIX: Do not attach UserId to the payload
    const payload = {
      ...this.myGroup.value
    };

    this._setupService
      .upsertPartMaster(payload)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true);
          } else {
            this.alertService.createAlert(res.message, 0);
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          const message = err.error?.message || 'Something went wrong.';
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