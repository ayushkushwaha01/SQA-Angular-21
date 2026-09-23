import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service'; // Adjust path if needed
import { AlertService } from 'src/app/shared/alert.service'; // Adjust path if needed

@Component({
  standalone: false,
  selector: 'app-parts-family-pop',
  templateUrl: './parts-family-pop.component.html',
  styleUrls: ['./parts-family-pop.component.scss']
})
export class PartsFamilyPopComponent implements OnInit {

  allDefects: any[] = [];
  defectColumns: any[][] = [];
  selectedIds: Set<number> = new Set<number>();
  
  // Store the full row data passed from the parent grid
  fullPartFamilyItem: any; 

  constructor(
    public dialogRef: MatDialogRef<PartsFamilyPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _setupService: SetupService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.allDefects = this.data.allDefects || [];
    this.defectColumns = [];
    for (let i = 0; i < this.allDefects.length; i += 10) {
      this.defectColumns.push(this.allDefects.slice(i, i + 10));
    }
    this.fullPartFamilyItem = this.data.fullItem; // Get the complete item
    
    // Load previously selected defects into the Set
    const incomingIds = this.data.selectedIds || [];
    this.selectedIds = new Set<number>(incomingIds);
  }

  // Bind this to [checked] in HTML
  isSelected(defectId: number): boolean {
    return this.selectedIds.has(defectId);
  }

  // Handle the checkbox change event
  toggleSelection(defectId: number, event: any) {
    if (event.checked) {
      this.selectedIds.add(defectId);
    } else {
      this.selectedIds.delete(defectId);
    }
  }

  close() {
    // Return false to tell parent no grid refresh is needed
    this.dialogRef.close(false); 
  }

  save() {
    // 1. Convert Set to Array and stringify to JSON
    const finalSelectedArray = Array.from(this.selectedIds);
    const defectsJson = JSON.stringify(finalSelectedArray);

    // 2. Construct the payload mapping to your C# PartFamilyModel
    const payload = {
      partFamilyId: this.fullPartFamilyItem.partFamilyId,
      partFamilyName: this.fullPartFamilyItem.partFamilyName,
      partFamilyCode: this.fullPartFamilyItem.partFamilyCode, // Required for Upsert
      defects: defectsJson, // The new JSON array
      modifiedBy: 0 // Optional: Replace with logged-in user ID if you have it
    };

    // 3. Call your existing Upsert method
    this._setupService.upsertPartFamily(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('Defects assigned successfully', 1);
          // Pass 'true' back to the parent to trigger a grid refresh
          this.dialogRef.close(true); 
        } else {
          this.alertService.createAlert(res.message || 'Failed to update defects', 0);
        }
      },
      error: (err) => {
        this.alertService.createAlert('An error occurred while saving', 0);
      }
    });
  }
}