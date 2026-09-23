import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data?.title || 'Confirmation' }}</h2>
    <mat-dialog-content>
      <p>{{ data?.content || data?.message || 'Are you sure you want to proceed?' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Cancel</button>
      <button mat-raised-button color="primary" (click)="close(true)">Confirm</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-actions { padding: 12px 16px; }
  `]
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
