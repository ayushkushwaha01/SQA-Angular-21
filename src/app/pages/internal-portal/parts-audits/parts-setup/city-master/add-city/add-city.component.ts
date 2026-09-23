import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-add-city',
  templateUrl: './add-city.component.html',
  styleUrls: ['./add-city.component.scss']
})
export class AddCityComponent implements OnInit {

  cityForm!: FormGroup;
  statesList: any[] = [];
  isEditMode: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AddCityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private setupservice: SetupService, 
    private alertService: AlertService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // 1. Initialize form WITH standard default values to prevent DB null errors
    this.cityForm = this.fb.group({
      cityId: [0],
      stateId: [null, Validators.required],
      cityName: ['', Validators.required], 
      isActive: [true],
      isDeleted: [false],
      createdBy: [0],   // Adding this in case SQL requires it
      modifiedBy: [0]   // Adding this in case SQL requires it
    });

    // 2. Fetch the dropdown data
    this.getAllStates();

    // 3. Pre-fill the form if Edit mode
    if (this.data && this.data.cityId) {
       this.isEditMode = true;
       
       // Pre-fill fields. The names here must exactly match what the backend GET API returns!
       this.cityForm.patchValue({
         cityId: this.data.cityId,
         stateId: this.data.stateId,
         cityName: this.data.cityName,
         isActive: this.data.isActive !== undefined ? this.data.isActive : true
       });
    }
  }

  getAllStates() {
    this.setupservice.getAllStates().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          // Only show active states in the dropdown
          this.statesList = res.data.filter((s: any) => s.isActive === true);
        } else {
          this.alertService.createAlert(res.message || 'Failed to load states', 0);
        }
      },
      error: (err) => {
        console.error('Error fetching states', err);
      }
    });
  }

  save(): void {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched();
      return;
    }

    const payload = {
        ...this.cityForm.value,
        cityName: this.cityForm.value.cityName.trim()
    };

    // If you have a combined add/update API, or separate them here:
    this.setupservice.addCity(payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.alertService.createAlert(res.message, 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message || 'Failed to save city', 0);
        }
      },
      error: (err) => {
        // Now this will show the REAL database error from the updated C# catch block!
        this.alertService.createAlert(err.error?.message || 'Server Error', 0);
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}