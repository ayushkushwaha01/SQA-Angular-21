import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SetupService } from "src/app/pages/setup/setup.service";
import { LookupService } from "src/app/pages/admin/lookup/lookup.service";
import { ManageUsersService } from "src/app/pages/admin/manage-user/manage-users.service";
import { InspectionService } from "../inspection.service";
import { AlertService } from "src/app/shared/alert.service";
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date.toDateString();
  }
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Component({
  standalone: false,
  selector: "app-add-record-pop",
  templateUrl: "./add-record-pop.component.html",
  styleUrls: ["./add-record-pop.component.scss"],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class AddRecordPopComponent implements OnInit {
  recordForm!: FormGroup;

  stages: any[] = [];
  shifts: any[] = [];
  suppliers: any[] = [];
  inspectors: any[] = [];
  partFamilies: any[] = [];
  partCodes: any[] = [];
  batches: any[] = [];
  allPartCodes: any[] = [];
  allBatches: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddRecordPopComponent>,
    private fb: FormBuilder,
    private setupService: SetupService,
    private lookupService: LookupService,
    private manageUsersService: ManageUsersService,
    private inspectionService: InspectionService,
    private alertService: AlertService // <-- Inject Alert Service
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadDropdownData();
  }

  initForm() {
    this.recordForm = this.fb.group({
      stageId: [null, Validators.required],
      supplierId: [null, Validators.required],
      inspectionDate: [null, Validators.required],
      shiftId: [null],
      time: [null, Validators.required],
      inspectorId: [null, Validators.required],
      partFamilyId: [null, Validators.required],
      partMasterId: [null, Validators.required],
      batchId: [null, Validators.required],
      remarks: [""],
      batchQuantity: [null],
      sampleQuantity: [null],
    });

    if (this.data) {
      this.recordForm.patchValue({
        stageId: this.data.stageId,
        supplierId: this.data.supplierId,
        shiftId: this.data.shiftId,
        inspectorId: this.data.inspectorId,
        inspectionDate: this.parseLocalDate(this.data.InspectionDate),
        time: this.data.Time,
        remarks: this.data.Remarks === "-" ? "" : this.data.Remarks,
        batchQuantity: this.data.BatchQuantity,
        sampleQuantity: this.data.SampleQuantity,
      });
    }
  }

  loadDropdownData() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success && res.data) {
        this.stages = res.data.filter((item: any) => item.codeMasterName === "Inspection-Stage" && item.isActive);
        this.shifts = res.data.filter((item: any) => item.codeMasterName === "Shift" && item.isActive);
      }
    });

    this.setupService.getAllSuppliers().subscribe((res: any) => {
      if (res.success && res.data) {
        this.suppliers = res.data.filter((item: any) => item.isActive);
      }
    });

    this.manageUsersService.getAllUsers().subscribe((res: any) => {
      if (res.success && res.data) {
        this.inspectors = res.data.filter((user: any) => user.isInspector && user.isActive);
      }
    });

    forkJoin({
      families: this.setupService.getPartFamilies({}).pipe(catchError(() => of({ success: false }))),
      parts: this.setupService.getPartMaster({ Keyword: "", Status: "" }).pipe(catchError(() => of({ success: false }))),
      batches: this.setupService.getBatchMaster({ Keyword: "", Status: "" }).pipe(catchError(() => of({ success: false })))
    }).subscribe(({ families, parts, batches }: any) => {
      if (families?.success && families.data?.data) {
        this.partFamilies = families.data.data.filter((item: any) => item.isActive);
      }
      if (parts?.success && parts.data?.data) {
        this.allPartCodes = parts.data.data.filter((item: any) => item.isActive);
      }
      if (batches?.success && batches.data?.data) {
        this.allBatches = batches.data.data.filter((item: any) => item.isActive);
      }

      if (this.data) {
        this.applyEditValues();
      }
    });
  }

  applyEditValues() {
    if (!this.data) return;

    // 1. Resolve and set Part Family
    let partFamilyId = this.data.partFamilyId ?? this.data.PartFamilyId;
    if (!partFamilyId && this.data.PartFamily && this.partFamilies.length) {
      const matchedFamily = this.partFamilies.find((f: any) =>
        f.partFamilyName?.toLowerCase().trim() === this.data.PartFamily?.toLowerCase().trim()
      );
      if (matchedFamily) partFamilyId = matchedFamily.partFamilyId;
    }

    if (partFamilyId) {
      this.recordForm.get("partFamilyId")?.setValue(partFamilyId);
      this.partCodes = this.allPartCodes.filter((item: any) => item.partFamilyId == partFamilyId);
    } else {
      this.partCodes = [...this.allPartCodes];
    }

    // 2. Resolve and set Part Name / Part Master
    let partMasterId = this.data.partMasterId ?? this.data.PartMasterId ?? this.data.partCodeId ?? this.data.PartCodeId ?? this.data.partId;
    if (!partMasterId && (this.data.PartName || this.data.PartNumber) && this.allPartCodes.length) {
      const partNameToMatch = (this.data.PartName || this.data.PartNumber || "").toLowerCase().trim();
      const matchedPart = this.allPartCodes.find((p: any) =>
        (p.partMasterCode && p.partMasterCode.toLowerCase().trim() === partNameToMatch) ||
        (p.partMasterName && p.partMasterName.toLowerCase().trim() === partNameToMatch)
      );
      if (matchedPart) {
        partMasterId = matchedPart.partMasterId;
        if (!this.partCodes.some((p: any) => p.partMasterId == partMasterId)) {
          this.partCodes = this.allPartCodes.filter((item: any) => item.partFamilyId == matchedPart.partFamilyId);
          this.recordForm.get("partFamilyId")?.setValue(matchedPart.partFamilyId);
        }
      }
    }

    if (partMasterId) {
      this.recordForm.get("partMasterId")?.setValue(partMasterId);
      this.batches = this.allBatches.filter((item: any) => item.partMasterId == partMasterId);
    } else {
      this.batches = [...this.allBatches];
    }

    // 3. Resolve and set Batch Number / Batch
    let batchId = this.data.batchId ?? this.data.BatchId ?? this.data.batchNumberId ?? this.data.BatchNumberId;
    if (!batchId && this.data.BatchNumber && this.data.BatchNumber !== '-' && this.allBatches.length) {
      const batchNameToMatch = this.data.BatchNumber.toLowerCase().trim();
      const matchedBatch = this.allBatches.find((b: any) =>
        b.batchNumber && b.batchNumber.toLowerCase().trim() === batchNameToMatch
      );
      if (matchedBatch) {
        batchId = matchedBatch.batchId;
        if (!this.batches.some((b: any) => b.batchId == batchId)) {
          this.batches = this.allBatches.filter((item: any) => item.partMasterId == matchedBatch.partMasterId);
        }
      }
    }

    if (batchId) {
      this.recordForm.get("batchId")?.setValue(batchId);
    }
  }

  saveRecord() {
    if (this.recordForm.valid) {
      const formData = this.recordForm.getRawValue();

      const payload = {
        ...formData,
        inspectionId: this.data && this.data.id ? this.data.id : 0,
        partMasterId: formData.partMasterId,
        batchId: formData.batchId,
        inspectionDate: this.formatLocalDate(formData.inspectionDate),
        createdBy: 1,
      };

      this.inspectionService.addInspection(payload).subscribe({
        next: (res: any) => {
          if (res && res.success) {
            this.alertService.createAlert("Record saved successfully!"); // <-- Success Alert added
            this.dialogRef.close(true); // Triggers loadData() in parent component
          } else {
            this.alertService.createAlert("Failed to save record: " + (res.message || "Unknown error")); // <-- Error Alert
          }
        },
        error: (err) => {
          console.error("Error saving record", err);
          if (err.status === 400 && err.error && err.error.errors) {
            this.alertService.createAlert("Validation Error: " + JSON.stringify(err.error.errors)); // <-- Validation Alert
          } else {
            this.alertService.createAlert("An error occurred while saving. Check console for details."); // <-- Generic Error Alert
          }
        },
      });
    } else {
      this.recordForm.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close(false);
  }

  onPartFamilyChange(partFamilyId: any) {
    this.partCodes = partFamilyId ? this.allPartCodes.filter((item: any) => item.partFamilyId == partFamilyId) : [];
    this.recordForm.get("partMasterId")?.setValue(null);
    this.recordForm.get("batchId")?.setValue(null);
    this.batches = [];
  }

  onPartMasterChange(partMasterId: any) {
    this.batches = partMasterId ? this.allBatches.filter((item: any) => item.partMasterId == partMasterId) : [];
    this.recordForm.get("batchId")?.setValue(null);
  }

  parseLocalDate(dateInput: any): Date | null {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;

    const dateStr = String(dateInput).trim();
    const hasTimezone = dateStr.endsWith('Z') || /[\+\-]\d{2}:?\d{2}$/.test(dateStr);

    if (hasTimezone) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } else {
      const cleanDateStr = dateStr.split('T')[0];
      const parts = cleanDateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }

    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  formatLocalDate(dateInput: any): string | null {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}