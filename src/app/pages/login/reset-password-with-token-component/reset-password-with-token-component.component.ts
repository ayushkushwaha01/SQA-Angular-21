import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ManageUsersService } from '../../manage-users/manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-reset-password-with-token-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reset-password-with-token-component.component.html',
  styleUrls: ['./reset-password-with-token-component.component.scss']
})
export class ResetPasswordWithTokenComponentComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean = false;
  public newPasswordType: string = 'password';
  public confirmPasswordType: string = 'password';
  private email: string = '';
  private token: string = '';

  constructor(
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      newPassword: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmPassword: [null, Validators.compose([Validators.required])]
    });
  }

  public toggleNewPassword(): void {
    this.newPasswordType = this.newPasswordType === 'password' ? 'text' : 'password';
  }

  public toggleConfirmPassword(): void {
    this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
  }

  ngOnInit(): void {
    // Grab the token and email from the URL (e.g. ?email=x&token=y)
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];

      if (!this.email || !this.token) {
        this.alertService.createAlert('Invalid reset link.', 0);
        this.router.navigate(['/login']);
      }
    });
  }

  public onSubmit(values: any): void {
    if (this.form.valid) {
      if (values.newPassword !== values.confirmPassword) {
        this.alertService.createAlert('Passwords do not match!', 0);
        return;
      }

      this.isLoading = true;
      const payload = {
        email: this.email,
        token: this.token,
        newPassword: values.newPassword
      };

      this.api.resetPasswordWithToken(payload).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res && (res.success || res.Success)) {
            this.alertService.createAlert('Password reset successfully. Please login.', 1);
            this.router.navigate(['/login']);
          } else {
            this.alertService.createAlert(res ? (res.message || res.Message) : 'Failed to reset password', 0);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.alertService.createAlert(err.error?.message || 'Token expired or invalid.', 0);
        }
      });
    }
  }
}
