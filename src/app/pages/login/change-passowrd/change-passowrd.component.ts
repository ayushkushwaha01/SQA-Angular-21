import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { Settings, SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-change-passowrd',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatSidenavModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './change-passowrd.component.html',
  styleUrl: './change-passowrd.component.scss',
})
export class ChangePassowrdComponent implements AfterViewInit {

  form!: FormGroup;
  passwordType = 'password';
  settings!: Settings;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.settings = this.settingsService.settings;
  }

  togglePassword() {
    this.passwordType =
      this.passwordType === 'password' ? 'text' : 'password';
  }

  onSubmit() {
    if (!this.form || !this.form.valid) return;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.settings.loadingSpinner = false;
    });
  }
}
