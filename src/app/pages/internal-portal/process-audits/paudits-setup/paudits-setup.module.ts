import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ← ADD ReactiveFormsModule

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewGuidelineComponent } from './view-guideline/view-guideline.component';


@NgModule({
  declarations: [
    // declare any other components under paudits-setup here
  
    ViewGuidelineComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,     // ← FIXES mat-dialog-content / mat-dialog-actions
    MatInputModule,      // ← FIXES matInput
    MatFormFieldModule,  // ← FIXES mat-form-field
    MatCheckboxModule,   // ← FIXES mat-checkbox
    MatCardModule,
    MatSelectModule,
    MatTooltipModule,
    MatIconModule
  ]
})
export class PauditsSetupModule { }