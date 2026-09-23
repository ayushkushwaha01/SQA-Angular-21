import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div style="background-color: rgb(198, 40, 40); text-align: center;">
      <h3 style="color: rgb(255, 255, 255) !important; font-weight: 500; margin: 0; padding: 12px 0;" mat-dialog-title>
        {{ data?.title || 'Confirm' }}
      </h3>
    </div>

    <mat-dialog-content style="text-align: center; max-height: 60vh; overflow-y: auto; padding-top: 16px;">
      <p>{{ data?.content || 'Are you sure you want to proceed?' }}</p>
    </mat-dialog-content>

    <div style="margin-bottom: 10px;">
      <mat-dialog-actions style="display: flex; justify-content: center; padding-top: 10px;">
        <button type="button" class="btn-default pull-right" mat-stroked-button color="warn"
          style="cursor: pointer; margin-left: 10px; color: rgb(198, 40, 40); background-color: white !important; display: flex; align-items: center;"
          (click)="onCancel()">Cancel</button>
        <button mat-raised-button style="color: white; background-color: rgb(198, 40, 40)" (click)="onConfirm()">
          <span>Confirm</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}