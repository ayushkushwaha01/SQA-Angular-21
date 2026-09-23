import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ManageUsersService } from '../../manage-users.service';
import { AlertService } from '../../../../shared/alert.service';
 
@Component({
  selector: 'app-add-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './add-roles.component.html',
  styleUrl: './add-roles.component.scss'
})
export class AddRolesComponent implements OnInit {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddRolesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private api: ManageUsersService, // <-- Updated Service Injection
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      roleId: [0],
      roleName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  onlyAlphabets(event: any) {
    const k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 32);
  }

  saveRole(): void {
    if (this.form.valid) {
      this.api.upsertRole(this.form.value).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true); 
          } else {
            this.alertService.createAlert(res.message || 'Something went wrong', 0);
          }
        },
        error: () => this.alertService.createAlert('Server Error', 0)
      });
    }
  }
}