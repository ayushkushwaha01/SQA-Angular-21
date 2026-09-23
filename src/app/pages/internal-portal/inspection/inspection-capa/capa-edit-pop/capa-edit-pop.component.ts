import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InspectionService } from '../../inspection.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-capa-edit-pop',
  templateUrl: './capa-edit-pop.component.html',
  styleUrls: ['./capa-edit-pop.component.scss']
})
export class CapaEditPopComponent implements OnInit {
  
  capaForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CapaEditPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Injects the passed row data
    private fb: FormBuilder,
    private inspectionService: InspectionService,
    private alertService: AlertService
  ) { }

  parseDateString(dateStr: any): Date | null {
    if (!dateStr || dateStr === '-') return null;
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

    if (String(dateStr).includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1].toLowerCase();
      const year = parseInt(parts[2], 10);
      
      const months: { [key: string]: number } = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      
      const month = months[monthStr.substring(0, 3)];
      if (month !== undefined && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    // Initialize form with existing data mapped from the grid
    this.capaForm = this.fb.group({
      dueDate: [this.parseDateString(this.data.dueDate)],
      etaDate: [this.parseDateString(this.data.etaDate)],
      completedDate: [this.parseDateString(this.data.completion)],
      auditorRemarks: [this.data.auditorRemarks || ''],
      auditeeResponse: [this.data.auditeeResponse || '']
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  saveCapaDetails() {
    const payload = {
      capaId: this.data.capaId, 
      dueDate: this.formatDate(this.capaForm.value.dueDate),
      etaDate: this.formatDate(this.capaForm.value.etaDate),
      completedDate: this.formatDate(this.capaForm.value.completedDate),
      auditorRemarks: this.capaForm.value.auditorRemarks,
      auditeeResponse: this.capaForm.value.auditeeResponse
    };

    this.inspectionService.updateCapaDetails(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('CAPA details updated successfully', 1);
          this.dialogRef.close(true); // Passes true to trigger grid refresh
        } else {
          this.alertService.createAlert(res.message, 0);
        }
      },
      error: (err) => {
        console.error("Failed to update CAPA", err);
        this.alertService.createAlert('An error occurred while updating.', 0);
      }
    });
  }
}