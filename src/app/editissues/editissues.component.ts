import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-editissues',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-3">
      <h3 mat-dialog-title>Edit Issue</h3>
      <div mat-dialog-content>
        <p>Edit issue details.</p>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">Cancel</button>
        <button mat-raised-button color="primary" (click)="dialogRef.close(true)">Save</button>
      </div>
    </div>
  `
})
export class EditissuesComponent {
  constructor(
    public dialogRef: MatDialogRef<EditissuesComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
