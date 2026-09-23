import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DefectsPopComponent } from '../defects-pop/defects-pop.component';
import { InspectionService } from '../../inspection.service';

@Component({
  standalone: false,
  selector: 'app-defects-pop-master',
  templateUrl: './defects-pop-master.component.html',
  styleUrls: ['./defects-pop-master.component.scss']
})
export class DefectsPopMasterComponent implements OnInit {

  gridCells: any[] = [];
  selectedYear: number;
  selectedMonth: number;
  isReadOnly: boolean = false;

  palette: { [key: number]: any } = {
    1: { bgColor: '#4c9a2a', textColor: '#ffffff' }, // Green
    2: { bgColor: '#3b82f6', textColor: '#ffffff' }, // Blue
    3: { bgColor: '#fcd34d', textColor: '#000000' }, // Yellow
    4: { bgColor: '#f8a000', textColor: '#ffffff' }, // Orange
    5: { bgColor: '#dc2626', textColor: '#ffffff' }  // Red
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DefectsPopMasterComponent>,
    private inspectionService: InspectionService
  ) {
    this.selectedYear = this.inspectionService.selectedYear;
    this.selectedMonth = this.inspectionService.selectedMonth;
    this.isReadOnly = (this.data && this.data.isReadOnly) || localStorage.getItem('UserType') === 'Supplier';

    if (this.data) {
      if (this.data.year) {
        this.selectedYear = Number(this.data.year);
      }
      if (this.data.month) {
        this.selectedMonth = Number(this.data.month);
      }
    }
  }

  ngOnInit(): void {
    this.fetchDefectData();
  }

  fetchDefectData(): void {
    this.inspectionService.getDefectStats(this.selectedYear, this.selectedMonth).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.mapToGrid(res.data);
        }
      },
      error: (err) => {
        console.error("Error fetching defect stats", err);
      }
    });
  }

  mapToGrid(defectsData: any[]): void {
    // Map API data to UI blocks
    this.gridCells = defectsData.map(defect => {
      const color = this.getColorBasedOnAverage(defect.averageStatus);
      return {
        // Example label output: "Scratch \n Count: 3 \n Avg: 2"
        label: `${defect.defectName}`,
        bgColor: color.bgColor,
        textColor: color.textColor,
        rawData: defect // Keep raw data if needed for clicking/toggling
      };
    });

    // Optional: Fill remaining blocks to always maintain the 5x10 (50 blocks) grid look
    const maxGridBlocks = 50;
    while (this.gridCells.length < maxGridBlocks) {
      this.gridCells.push({
        label: '-',
        bgColor: '#f9f9f9',
        textColor: '#cccccc'
      });
    }
  }

  // Define your status color logic here
  getColorBasedOnAverage(avgStatus: number): any {
    const status = Math.round(avgStatus);
    return this.palette[status] || this.palette[5]; // Fallback to 5 (Red)
  }

  toggleColor(cell: any): void {
    if (this.isReadOnly) return;
    if (cell.label === '-') return; // ignore empty cells
    console.log('Clicked defect:', cell.rawData);
    // Add custom toggle logic if needed
  }

  close(): void {
    this.dialogRef.close();
  }

  getMonthName(monthNum: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNum - 1] || '';
  }

}