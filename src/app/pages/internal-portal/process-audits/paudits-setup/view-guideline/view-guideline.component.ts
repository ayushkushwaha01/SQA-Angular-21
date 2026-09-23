import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-view-guideline',
  templateUrl: './view-guideline.component.html'
})
export class ViewGuidelineComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewGuidelineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}
}