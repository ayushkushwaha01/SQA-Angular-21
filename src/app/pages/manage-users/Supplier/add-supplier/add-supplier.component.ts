import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ManageUsersService } from '../../manage-users.service';
import { AlertService } from '../../../../shared/alert.service';
 
@Component({
  selector: 'app-add-supplier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.scss'
})
export class AddSupplierComponent implements OnInit {
  myGroup: FormGroup;
  states: any[] = [];
  allCities: any[] = [];
  filteredCities: any[] = [];
  supplierId: number = 0;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.myGroup = this.fb.group({
      userName: ['', Validators.required],
      supplierName: ['', Validators.required],
      contactPerson: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      stateId: [null, Validators.required],
      cityId: [null, Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns() {
    // 1. Fetch States
    this.api.getStates().subscribe((res: any) => {
      if (res.success) this.states = res.data;
    });

    // 2. Fetch All Cities
    this.api.getCities().subscribe((res: any) => {
      if (res.success) {
        this.allCities = res.data;
        
        // 3. Patch data if in Edit Mode (Wait for cities to load first)
        if (this.data) {
          this.supplierId = this.data.supplierId;
          this.onStateChange(this.data.stateId); // Pre-filter cities
          this.myGroup.patchValue(this.data);
        }
      }
    });
  }

  onStateChange(stateId: number) {
    // Filter the master list of cities to only show those belonging to the selected StateId
    this.filteredCities = this.allCities.filter(c => c.stateId === stateId);
    
    // Clear city value if user changes state manually via UI
    if(this.myGroup.get('stateId')?.dirty) {
        this.myGroup.get('cityId')?.setValue(null);
    }
  }

  saveSupplier() {
    if (this.myGroup.valid) {
      const payload = { ...this.myGroup.value, supplierId: this.supplierId };
      this.api.upsertSupplier(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message || 'Supplier saved successfully', 1);
            this.dialogRef.close(true);
          } else {
            this.alertService.createAlert(res.message || 'Something went wrong', 0);
          }
        },
        error: () => this.alertService.createAlert('Server error while saving supplier', 0)
      });
    } else {
      this.myGroup.markAllAsTouched();
    }
  }

  close(): void { this.dialogRef.close(false); }
  
  onlyNumbers(event: any) {
    const k = event.charCode;
    return ((k > 47 && k < 58));
  }
}