import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
 

@Component({
  standalone: false,
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.scss']
})
export class AddSupplierComponent implements OnInit {
  isEditMode: boolean = false;
  supplierForm!: FormGroup;
  states: any[] = [];
  allCities: any[] = []; 
  cities: any[] = [];    

  constructor(
    private dialogRef: MatDialogRef<AddSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private setupService: SetupService,
    private alertService: AlertService // Injected AlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupStateChangeListener(); 
    this.loadDropdowns();

    if (this.data && this.data.supplierId) {
      this.isEditMode = true;
      this.supplierForm.patchValue(this.data);
    }
  }

 initForm() {
    this.supplierForm = this.fb.group({
      supplierId: [0],
      // Example of adding multiple validators:
      supplierName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      contactPerson: [''], // Add validators here if in your reference
      stateId: [null, Validators.required],
      cityId: [null, Validators.required],
      address: [''],
      isActive: [true],
      createdBy: [0], 
      modifiedBy: [0], 
      deletedBy: [0],  
      isDeleted: [false]
    });
  }

  setupStateChangeListener() {
    this.supplierForm.get('stateId')?.valueChanges.subscribe(selectedStateId => {
      this.filterCities(selectedStateId);

      const currentCityId = this.supplierForm.get('cityId')?.value;
      const isCityValidForState = this.cities.some(c => c.cityId === currentCityId);
      
      if (!isCityValidForState) {
        this.supplierForm.get('cityId')?.setValue(null);
      }
    });
  }

  filterCities(stateId: number) {
    if (stateId) {
      this.cities = this.allCities.filter(city => city.stateId === stateId);
    } else {
      this.cities = [];
    }
  }

loadDropdowns() {
    // Load States
    this.setupService.getAllStates().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          // FILTER APPLIED HERE: Only keep states where isActive is true
          const allFetchedStates = res.data || [];
          this.states = allFetchedStates.filter((state: any) => state.isActive === true); 
        } else {
          this.alertService.createAlert(res.message || 'Failed to load states');
        }
      },
      error: (err) => {
        console.error('Error fetching states', err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while fetching states.');
      }
    });

    // Load Cities
    this.setupService.getAllCities().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          // Optional: If cities also have an isActive flag, you can filter them here similarly:
          // const allFetchedCities = res.data || [];
          // this.allCities = allFetchedCities.filter((city: any) => city.isActive === true);
          this.allCities = res.data || [];
          
          const currentStateId = this.supplierForm.get('stateId')?.value;
          if (currentStateId) {
            this.filterCities(currentStateId);
          }
        } else {
          this.alertService.createAlert(res.message || 'Failed to load cities');
        }
      },
      error: (err) => {
        console.error('Error fetching cities', err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while fetching cities.');
      }
    });
  }

  save(): void {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    const payload = { ...this.supplierForm.value };

    if (!this.isEditMode) {
      delete payload.supplierId;
    }

    if (this.isEditMode) {
      // Note: Make sure this uses the correct update method if your service has one (e.g., updateSupplier)
      this.setupService.addSupplier(payload).subscribe({
        next: (res: any) => {
          if (res && res.success) {
            this.alertService.createAlert('Supplier updated successfully');
            this.dialogRef.close(true); 
          } else {
            this.alertService.createAlert(res.message || 'Failed to update supplier');
          }
        },
        error: (err) => {
          console.error('Error updating supplier', err);
          this.alertService.createAlert(err.error?.message || 'An error occurred while updating the supplier.');
        }
      });
    } else {
      this.setupService.addSupplier(payload).subscribe({
        next: (res: any) => {
          if (res && res.success) {
            this.alertService.createAlert('Supplier saved successfully');
            this.dialogRef.close(true); 
          } else {
            this.alertService.createAlert(res.message || 'Failed to save supplier');
          }
        },
        error: (err) => {
          console.error('Error saving supplier', err);
          this.alertService.createAlert(err.error?.message || 'An error occurred while saving the supplier.');
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}