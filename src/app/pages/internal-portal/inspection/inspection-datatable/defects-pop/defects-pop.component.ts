import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InspectionService } from '../../inspection.service';
 // Update path as needed

@Component({
  standalone: false,
  selector: 'app-defects-pop',
  templateUrl: './defects-pop.component.html',
  styleUrls: ['./defects-pop.component.scss']
})
export class DefectsPopComponent implements OnInit {

  gridCells: any[] = [];
  inspectionId: number;
  isReadOnly: boolean = false;

  // New Color Mapping: 1=Green, 2=Blue, 3=Yellow, 4=Orange, 5=Red
  palette: { [key: number]: any } = {
    1: { bgColor: '#4c9a2a', textColor: '#ffffff' }, // Green
    2: { bgColor: '#3b82f6', textColor: '#ffffff' }, // Blue
    3: { bgColor: '#fcd34d', textColor: '#000000' }, // Yellow
    4: { bgColor: '#f8a000', textColor: '#ffffff' }, // Orange
    5: { bgColor: '#dc2626', textColor: '#ffffff' }  // Red
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DefectsPopComponent>,
    private inspectionService: InspectionService
  ) {
    // Extract the inspectionId passed from the datatable
    this.inspectionId = this.data.id;
    this.isReadOnly = (this.data && this.data.isReadOnly) || localStorage.getItem('UserType') === 'Supplier';
  }

  ngOnInit(): void {
    this.fetchDefects();
  }

  fetchDefects(): void {
    this.inspectionService.getDefectsByInspection(this.inspectionId).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.buildGrid(res.data);
        }
      },
      error: (err) => {
        console.error("Failed to load defects", err);
      }
    });
  }

  buildGrid(defectsData: any[]): void {
    const cells = defectsData.map(defect => {
      const color = this.palette[defect.status] || this.palette[5]; // Fallback to 5 (Red)
      return {
        defectId: defect.defectId,
        label: defect.defectName,
        status: defect.status,
        bgColor: color.bgColor,
        textColor: color.textColor,
        isBlank: false
      };
    });

    const minCells = 50;
    if (cells.length < minCells) {
      const extraCount = minCells - cells.length;
      for (let i = 0; i < extraCount; i++) {
        cells.push({
          defectId: 0,
          label: '',
          status: 0,
          bgColor: '#f5f5f5', // Light grey
          textColor: 'transparent',
          isBlank: true
        });
      }
    } else {
      const remainder = cells.length % 5;
      if (remainder > 0) {
        const extraCount = 5 - remainder;
        for (let i = 0; i < extraCount; i++) {
          cells.push({
            defectId: 0,
            label: '',
            status: 0,
            bgColor: '#f5f5f5', // Light grey
            textColor: 'transparent',
            isBlank: true
          });
        }
      }
    }

    this.gridCells = cells;
  }

  toggleColor(cell: any): void {
    if (this.isReadOnly || cell.isBlank) return;
    // Cycle logic: 5 -> 1 -> 2 -> 3 -> 4 -> 5
    cell.status = (cell.status % 5) + 1;
    
    // Apply the new color properties
    const color = this.palette[cell.status];
    cell.bgColor = color.bgColor;
    cell.textColor = color.textColor;
  }

  saveAndClose(): void {
    const statuses: { [key: string]: number } = {};
    
    this.gridCells.forEach(cell => {
      if (!cell.isBlank) {
        statuses[cell.defectId.toString()] = cell.status;
      }
    });

    const payload = {
      inspectionId: this.inspectionId,
      statuses: statuses
    };

    this.inspectionService.updateDefectsStatus(payload).subscribe({
      next: (res) => {
        this.dialogRef.close(true); // Close and indicate success
      },
      error: (err) => {
        console.error("Failed to save defect statuses", err);
        this.dialogRef.close(false); 
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}