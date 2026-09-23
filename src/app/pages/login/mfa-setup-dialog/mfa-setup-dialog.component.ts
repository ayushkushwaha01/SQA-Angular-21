import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AlertService } from '../../../shared/alert.service';
import { ManageUsersService } from '../../manage-users/manage-users.service';

@Component({
  selector: 'app-mfa-setup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './mfa-setup-dialog.component.html',
  styleUrl: './mfa-setup-dialog.component.scss'
})
export class MfaSetupDialogComponent implements OnInit {

  qrCodeUrl: string = '';
  manualKey: string = '';
  verificationCode: string = '';
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<MfaSetupDialogComponent>,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {}

 ngOnInit(): void {
    // Automatically fetch the QR code when the dialog opens
    this.api.setupAuthenticator().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.qrCodeUrl = res.qrCode;
          this.manualKey = res.manualKey;
        }
        this.isLoading = false;
      },
      error: () => {
        this.alertService.createAlert('Failed to generate QR code.', 0);
        this.isLoading = false;
        this.close();
      }
    });
  } 

  verifyCode() {
    if (!this.verificationCode || this.verificationCode.length < 6) return;

    this.api.verifyAuthenticator({ code: this.verificationCode }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert(res.message, 1);
          this.dialogRef.close(true); // Close and return success
        }
      },
      error: (err: any) => {
        this.alertService.createAlert(err.error?.message || 'Invalid code. Try again.', 0);
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }

}
