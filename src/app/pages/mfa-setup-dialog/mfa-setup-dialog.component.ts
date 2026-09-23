import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mfa-setup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>MFA Setup Verification</h2>
    <mat-dialog-content>
      <p>Please enter your 6-digit authentication code to verify MFA setup:</p>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Verification Code</mat-label>
        <input matInput [(ngModel)]="verificationCode" placeholder="Enter 6-digit code" maxlength="6">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!verificationCode || verificationCode.length < 6" (click)="verify()">Verify & Enable</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-actions { padding: 12px 16px; }
  `]
})
export class MfaSetupDialogComponent {
  verificationCode = '';

  constructor(public dialogRef: MatDialogRef<MfaSetupDialogComponent>) {}

  verify(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
