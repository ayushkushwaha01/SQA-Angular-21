import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  standalone: false,
  selector: 'app-parts-master-suppliers',
  templateUrl: './parts-master-suppliers.component.html',
  styleUrls: ['./parts-master-suppliers.component.scss']
})
export class PartsMasterSuppliersComponent implements OnInit {

  availableSuppliers: any[] = [];
  assignedSuppliers: any[] = [];
  selectedAvailable: any[] = [];
  selectedAssigned: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PartsMasterSuppliersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alertService: AlertService,
    private _setupService: SetupService,
    private fb: FormBuilder,
    private api: ManageUsersService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  allData: any[] = [];

  loadSuppliers() {
    this.api.getSuppliers().subscribe((res: any) => {
      if (res.success) {
        const allSuppliers = res.data || [];
        const selectedIds = this.data?.supplierIds
          ? this.data.supplierIds.split(',').map((x: string) => +x)
          : [];

        this.assignedSuppliers = allSuppliers.filter((x: any) =>
          selectedIds.includes(x.supplierId)
        );

        this.availableSuppliers = allSuppliers.filter((x: any) =>
          !selectedIds.includes(x.supplierId)
        );
      }
    });
  }

  addSuppliers() {
    this.assignedSuppliers.push(...this.selectedAvailable);
    this.availableSuppliers = this.availableSuppliers.filter(
      x => !this.selectedAvailable.includes(x)
    );
    this.selectedAvailable = [];
  }

  removeSuppliers() {
    this.availableSuppliers.push(...this.selectedAssigned);
    this.assignedSuppliers = this.assignedSuppliers.filter(
      x => !this.selectedAssigned.includes(x)
    );
    this.selectedAssigned = [];
  }

  save() {
    const assignedIds = this.assignedSuppliers.map((s: any) => s.supplierId).join(',');
    const payload = {
      ...this.data,
      supplierIds: assignedIds
    };

    this._setupService.upsertPartMaster(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('Suppliers updated successfully', 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message || 'Failed to update suppliers', 0);
        }
      },
      error: () => this.alertService.createAlert('Server error updating suppliers', 0)
    });
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  close() {
    this.dialogRef.close(false);
  }
}