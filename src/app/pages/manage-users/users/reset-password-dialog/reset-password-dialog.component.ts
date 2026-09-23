import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ManageUsersService } from '../../manage-users.service';
import { AlertService } from '../../../../shared/alert.service';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reset-password-dialog.component.html',
  styleUrl: './reset-password-dialog.component.scss'
})
export class ResetPasswordDialogComponent implements OnInit {

  myform: FormGroup;
  isSubmitting = false;
  dialogTitle = 'Reset Password';
  isSelfChange = false;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.isSelfChange = !!(this.data && this.data.isSelfChange);
    this.dialogTitle = this.isSelfChange ? 'Change Password' : 'Reset Password';

    this.myform = this.fb.group({
      UserId: new FormControl(this.data ? (this.data.userId || this.data.UserId) : null),
      OldPassword: new FormControl(null, this.isSelfChange ? [Validators.required] : []),
      Password: new FormControl(null, Validators.compose([Validators.required])),
      UserPassword: new FormControl(null, Validators.compose([Validators.required]))
    });
  }

  ngOnInit() {
  }

  

  close(): void {
    this.dialogRef.close();
  }

  saveData() {
    if (this.myform.valid) {
      let password = this.myform.controls['Password'].value;
      let confirmPassword = this.myform.controls['UserPassword'].value;
      let oldPassword = this.myform.controls['OldPassword'].value;
      
      // Validation Check
      if (password !== confirmPassword) {
        this.alertService.createAlert('Passwords do not match', 0);
        return;
      } 
      
      this.isSubmitting = true;
      
      let payload: any = {
        userId: this.myform.value.UserId,
        newPassword: password
      };

      if (this.isSelfChange && oldPassword) {
        payload.oldPassword = oldPassword;
      }

      this.api.resetPassword(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          if (res.success) {
            this.alertService.createAlert(res.message || 'Password changed successfully', 1);
            this.dialogRef.close(true);
          } else {
            this.alertService.createAlert(res.message || 'Failed to update password', 0);
          }
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.alertService.createAlert(err?.error?.message || "Server Error while updating password", 0);
        }
      });
      
    } else {
      this.myform.markAllAsTouched();
    }
  }
}