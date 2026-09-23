import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-status-change',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Change Status</h2>
    <mat-dialog-content>
      <p>Are you sure you want to change the status?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">No</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Yes</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-actions { padding: 12px 16px; }
  `]
})
export class StatusChangeComponent {
  constructor(
    public dialogRef: MatDialogRef<StatusChangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
