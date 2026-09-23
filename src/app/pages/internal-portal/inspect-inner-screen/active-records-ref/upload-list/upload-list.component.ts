import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InspectionService } from '../../../inspection/inspection.service';
 

@Component({
  standalone: false,
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss']
})
export class UploadListComponent implements OnInit {
  
  defectsString: string = 'Loading...';  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadListComponent>,
    private inspectionService: InspectionService // <-- Inject service
  ) { }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.fetchDefects(this.data.id);
    } else {
      this.defectsString = 'No ID provided.';
    }
  }

  fetchDefects(id: number) {
    this.inspectionService.getDefectsList(id).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data && res.data.length > 0) {
          // Join the list of strings with a comma and a space
          this.defectsString = res.data.join(', ');
        } else {
          this.defectsString = 'No defects recorded.';
        }
      },
      error: (err) => {
        console.error('Failed to load defects', err);
        this.defectsString = 'Error loading defects.';
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}