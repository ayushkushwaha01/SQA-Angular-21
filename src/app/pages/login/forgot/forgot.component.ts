import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { emailValidator } from 'src/app/theme/utils/app-validators';
import { ManageUsersService } from '../../manage-users/manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-forgot',
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
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss'
})
export class ForgotComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      email: [null, Validators.compose([Validators.required, emailValidator])],
    });
  }

  ngOnInit(): void {
  }

  public onSubmit(values: any): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.api.forgotPassword(values.email).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res && (res.success || res.Success)) {
            this.alertService.createAlert(res.message || res.Message || 'Password reset link sent to your email.', 1);
            this.router.navigate(['/login']);
          } else {
            this.alertService.createAlert(res ? (res.message || res.Message) : 'Failed to process request', 0);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.alertService.createAlert(err.error?.message || 'Failed to send reset link. Please try again.', 0);
        }
      });
    }
  }
}
