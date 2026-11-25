  
// import { Component, Inject, OnInit } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
// import { SetupService } from 'src/app/pages/setup/setup.service';
// import { AlertService } from 'src/app/shared/alert.service';

// @Component({
//   standalone: false,
//   selector: 'app-add-parameterforpartmaster',
//   templateUrl: './add-parameterforpartmaster.component.html',
//   styleUrls: ['./add-parameterforpartmaster.component.scss']
// })
// export class AddParameterforpartmasterComponent implements OnInit {

//   isEditMode: boolean = false;
//   isDragOver = false;
//   selectedFileName: string = '';
//   selectedFile: File | null = null;
//   myGroup!: FormGroup;
//   partMasterId!: number;

//   constructor(
//     private dialogRef: MatDialogRef<AddParameterforpartmasterComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any, 
//     private alertService: AlertService, 
//     private _setupService: SetupService, 
//     private fb: FormBuilder,
//     private lookupService: LookupService
//   ) { }

//   ngOnInit(): void {
//     this.partMasterId = this.data.partMasterId;
//     console.log("Part Master ID:", this.partMasterId, "Stage:", this.data.stage);
    
//     this.formInit(this.data);
//     this.getLookups();
//     this.getPartAuditCategories();
//   }

//   formInit(data: any) {
//     this.myGroup = this.fb.group({
//       ParameterId: [data?.parameterId || 0],
//       PartMasterId: [data?.partMasterId || 0],
//       PartFamilyId: [data?.partFamilyId || null], // Optional if applicable
      
//       // 🔥 CRITICAL FIX: Capture the stage passed from the parent component
//       Stage: [data?.stage || ''], 

//       PartId: [
//         data?.partId || null,
//         Validators.required
//       ],
//       ParmeterName: [
//         data?.parmeterName || '',
//         Validators.required
//       ],
//       Spec: [
//         data?.spec || ''
//       ],
//       Min: [
//         data?.min || '',
//         [Validators.pattern(/^\d+(\.\d+)?$/)]
//       ],
//       Max: [
//         data?.max || '',
//         [Validators.pattern(/^\d+(\.\d+)?$/)]
//       ],
//       Method: [
//         data?.method || ''
//       ],
//       UnitId: [
//         data?.unitId || null,
//         Validators.required
//       ]
//     });
//   }

//   get f() {
//     return this.myGroup.controls;
//   }

//   allowNumericOnly(event: KeyboardEvent): boolean {
//     const input = event.target as HTMLInputElement;
//     const char = event.key;

//     if (/[0-9]/.test(char)) {
//       return true;
//     }
//     if (char === '.' && !input.value.includes('.')) {
//       return true;
//     }
//     if (
//       char === 'Backspace' ||
//       char === 'Delete' ||
//       char === 'ArrowLeft' ||
//       char === 'ArrowRight' ||
//       char === 'Tab'
//     ) {
//       return true;
//     }

//     event.preventDefault();
//     return false;
//   }

//   lookups: any[] = [];

//   getLookups() {
//     this.lookupService.getLookups().subscribe((res: any) => {
//       if (res.success) {
//         this.lookups = res.data.filter((x: any) => x.codeId === 3);
//       }
//     });
//   }

//   UpsertParameter(): void {
//     if (this.myGroup.invalid) {
//       this.myGroup.markAllAsTouched();
//       return;
//     }

//     // this.myGroup.value now automatically includes the Stage property
//     this._setupService.upsertParameter(this.myGroup.value)
//       .subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             this.alertService.createAlert(res.message, 1);
//             this.dialogRef.close(true);
//           } else {
//             this.alertService.createAlert(res.message, 0);
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           this.alertService.createAlert(
//             err?.error?.message || 'Something went wrong.',
//             0
//           );
//         }
//       });
//   }

//   partAuditCategories: any[] = [];
  
//   getPartAuditCategories() {
//     this._setupService.getPartAuditCategories(null)
//       .subscribe((res: any) => {
//         if (res.success) {
//           this.partAuditCategories = res.data.data;
//         }
//       });
//   }

//   close(): void {
//     this.dialogRef.close();
//   }
// }






import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-add-parameterforpartmaster',
  templateUrl: './add-parameterforpartmaster.component.html',
  styleUrls: ['./add-parameterforpartmaster.component.scss']
})
export class AddParameterforpartmasterComponent implements OnInit {

  isEditMode: boolean = false;
  isDragOver = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  myGroup!: FormGroup;
  partMasterId!: number;
  stagesList: any[] = []; // Array for stages dropdown

  constructor(
    private dialogRef: MatDialogRef<AddParameterforpartmasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private alertService: AlertService, 
    private _setupService: SetupService, 
    private fb: FormBuilder,
    private lookupService: LookupService
  ) { }

  ngOnInit(): void {
    this.partMasterId = this.data.partMasterId;
    this.stagesList = this.data.stagesList || []; // Capture stages from dialog data
    
    this.formInit(this.data);
    this.getLookups();
    this.getPartAuditCategories();
  }

  formInit(data: any) {
    this.myGroup = this.fb.group({
      ParameterId: [data?.parameterId || 0],
      PartMasterId: [data?.partMasterId || 0],
      PartFamilyId: [data?.partFamilyId || null],
      
      // Stage selection control
      Stage: [data?.stage || '', Validators.required], 

      PartId: [
        data?.partId || null,
        Validators.required
      ],
      ParmeterName: [
        data?.parmeterName || '',
        Validators.required
      ],
      Spec: [
        data?.spec || ''
      ],
      Min: [
        data?.min || '',
        [Validators.pattern(/^\d+(\.\d+)?$/)]
      ],
      Max: [
        data?.max || '',
        [Validators.pattern(/^\d+(\.\d+)?$/)]
      ],
      Method: [
        data?.method || ''
      ],
      UnitId: [
        data?.unitId || null,
        Validators.required
      ]
    });
  }

  get f() {
    return this.myGroup.controls;
  }

  allowNumericOnly(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    const char = event.key;

    if (/[0-9]/.test(char)) return true;
    if (char === '.' && !input.value.includes('.')) return true;
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) return true;

    event.preventDefault();
    return false;
  }

  lookups: any[] = [];
  getLookups() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.lookups = res.data.filter((x: any) => x.codeId === 3);
      }
    });
  }

  UpsertParameter(): void {
    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }

    this._setupService.upsertParameter(this.myGroup.value)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true);
          } else {
            this.alertService.createAlert(res.message, 0);
          }
        },
        error: (err) => {
          console.error(err);
          this.alertService.createAlert(
            err?.error?.message || 'Something went wrong.',
            0
          );
        }
      });
  }

  partAuditCategories: any[] = [];
  getPartAuditCategories() {
    this._setupService.getPartAuditCategories(null)
      .subscribe((res: any) => {
        if (res.success) {
          this.partAuditCategories = res.data.data;
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}