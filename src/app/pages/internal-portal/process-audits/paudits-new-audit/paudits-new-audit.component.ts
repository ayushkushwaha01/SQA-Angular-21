import { Component, Inject, Optional, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProcessAuditService } from '../process-audit.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
 
@Component({
  standalone: false,
  selector: 'app-paudits-new-audit',
  templateUrl: './paudits-new-audit.component.html'
})
export class PauditsNewAuditComponent implements OnInit {
  form: FormGroup;
  commodities: any[] = [];
  suppliers: any[] = [];
  states: any[] = [];
  allCities: any[] = [];
  filteredCities: any[] = [];
  auditors: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PauditsNewAuditComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private api: ProcessAuditService,
    private setupApi: SetupService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      processAuditId: [this.data ? this.data.processAuditId : 0],
      commodityId: [this.data ? this.data.commodityId : null, Validators.required],
      supplierId: [this.data ? this.data.supplierId : null, Validators.required],
      stateId: [this.data ? this.data.stateId : null, Validators.required],
      cityId: [this.data ? this.data.cityId : null, Validators.required],
      auditorId: [this.data ? this.data.auditorId : null, Validators.required],
      auditDate: [this.data ? this.data.auditDate : null, Validators.required],
      remarks: [this.data ? this.data.remarks : null],
      statusId: [this.data ? this.data.statusId : null], // Optional on creation
      isDone: [this.data ? this.data.isDone : false]
    });
  }

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.api.getCommodities().subscribe((res: any) => { if (res.success) this.commodities = res.data; });
    this.setupApi.getAllSuppliers().subscribe((res: any) => { if (res.success) this.suppliers = res.data; });
    this.setupApi.getAllStates().subscribe((res: any) => { if (res.success) this.states = res.data; });
    
    // Fetch users and filter ONLY those marked as Auditor
    this.api.getUsers().subscribe((res: any) => { 
      if (res.success) {
        this.auditors = res.data.filter((u: any) => u.isAuditor === true);
      }
    });

    this.setupApi.getAllCities().subscribe((res: any) => { 
      if (res.success) {
        this.allCities = res.data;
        if (this.data && this.data.stateId) {
          this.onStateChange(this.data.stateId);
        }
      }
    });
  }

  onStateChange(stateId: number) {
    this.filteredCities = this.allCities.filter(c => c.stateId === stateId);
    if(this.form.get('stateId')?.dirty) {
      this.form.get('cityId')?.setValue(null);
    }
  }

  save() {
    if (this.form.valid) {
      const payload = { ...this.form.value };

      if (payload.auditDate) {
        const d = new Date(payload.auditDate);
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        
        payload.auditDate = `${year}-${month}-${day}`;
      }

      this.api.upsertAudit(payload).subscribe((res: any) => {
        if(res.success) {
          this.alertService.createAlert(this.data ? 'Audit Updated Successfully' : 'Audit Created Successfully', 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message || 'Error occurred', 0);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  close(): void { this.dialogRef.close(); }
}