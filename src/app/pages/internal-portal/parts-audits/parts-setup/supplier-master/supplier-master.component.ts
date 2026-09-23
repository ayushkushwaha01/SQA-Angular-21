import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';

@Component({
  standalone: false,
  selector: 'app-supplier-master',
  templateUrl: './supplier-master.component.html',
  styleUrls: ['./supplier-master.component.scss']
})
export class SupplierMasterComponent implements OnInit {
  allSuppliers: any[] = [];
  filteredData: any[] = [];
  showFilters: boolean = false;
  
  // New variables for Filtering
  filterForm: FormGroup;
  uniqueStates: string[] = [];
  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog, 
    private setupService: SetupService,
    private alertService: AlertService
  ) { 
    // Initialize the form group
    this.filterForm = this.fb.group({
      supplierName: [''],
      contactPerson: [''],
      stateName: [null],
      status: [null]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.setupService.getAllSuppliers().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          // Exclude hard-deleted items
          this.allSuppliers = res.data ? res.data.filter((s: any) => !s.isDeleted) : [];
          this.filteredData = [...this.allSuppliers];
          
          // Dynamically extract unique states for the dropdown
          const states = this.allSuppliers.map(s => s.stateName).filter(state => !!state);
          this.uniqueStates = [...new Set(states)];
        } else {
          this.alertService.createAlert(res.message || 'Failed to load suppliers');
        }
      },
      error: (err) => {
        console.error('Error fetching suppliers', err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while fetching suppliers.');
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilter() {
    const filters = this.filterForm.value;

    this.filteredData = this.allSuppliers.filter(item => {
      let matchesSupplier = true;
      let matchesContact = true;
      let matchesState = true;
      let matchesStatus = true;

      if (filters.supplierName) {
        matchesSupplier = item.supplierName?.toLowerCase().includes(filters.supplierName.toLowerCase());
      }
      
      if (filters.contactPerson) {
        matchesContact = item.contactPerson?.toLowerCase().includes(filters.contactPerson.toLowerCase());
      }
      
      if (filters.stateName) {
        matchesState = item.stateName === filters.stateName;
      }
      
      // Strict check because false (Inactive) is a valid filterable boolean
      if (filters.status !== null && filters.status !== undefined && filters.status !== '') {
        matchesStatus = item.isActive === filters.status;
      }

      // Record must meet ALL provided filter criteria
      return matchesSupplier && matchesContact && matchesState && matchesStatus;
    });
  }

  clearFilter() {
    this.filterForm.reset();
    this.filteredData = [...this.allSuppliers];
  }

  addSupplier(data: any = null) {
    const dialogRef = this.dialog.open(AddSupplierComponent, {
      width: '600px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSuppliers(); 
      }
    });
  }

  toggleStatus(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = { ...item, isActive: !item.isActive };
        this.setupService.toggleSupplierStatus(payload).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert('Status updated successfully', 1);
            } else {
              this.alertService.createAlert(res.message || 'Failed to update status', 0);
            }
          },
          error: (err) => {
            console.error('Error toggling status', err);
            this.alertService.createAlert(err.error?.message || 'An error occurred while updating status.', 0);
          }
        });
      }
    });
  }

  deleteSupplier(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to delete this supplier?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = { ...item, isDeleted: true };
        this.setupService.deleteSupplier(payload).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              this.alertService.createAlert('Supplier deleted successfully', 1);
              this.loadSuppliers();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete supplier', 0);
            }
          },
          error: (err) => {
            console.error('Error deleting supplier', err);
            this.alertService.createAlert(err.error?.message || 'An error occurred while deleting the supplier.', 0);
          }
        });
      }
    });
  }
}