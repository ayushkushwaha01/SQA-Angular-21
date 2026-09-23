import { Component, OnInit } from '@angular/core';
import { AddCityComponent } from './add-city/add-city.component';
import { MatDialog } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-city-master',
  templateUrl: './city-master.component.html',
  styleUrls: ['./city-master.component.scss']
})
export class CityMasterComponent implements OnInit {

  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  // Variables for the cities
  citiesList: any[] = [];
  filteredCities: any[] = [];
  uniqueStates: string[] = []; // Holds unique state names for the dropdown

  showFilters: boolean = false;
  filterForm: FormGroup;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 45;


  constructor(
    private fb: FormBuilder, // Injected FormBuilder
    private dialog: MatDialog,
    private setupservice: SetupService,
    private alertService: AlertService
  ) {
    // Initialize the form
    this.filterForm = this.fb.group({
      cityName: [''],
      stateName: [null],
      status: [null]
    });
  }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.getAllCities();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getAllCities() {
    this.setupservice.getAllCities().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.citiesList = res.data;
          this.filteredCities = [...this.citiesList];

          // Extract unique state names for the dropdown
          const states = this.citiesList.map(city => city.stateName).filter(state => !!state);
          this.uniqueStates = [...new Set(states)];
        } else {
          this.alertService.createAlert(res.message || 'Failed to load cities', 0);
        }
      },
      error: (err) => {
        console.error('Error fetching cities', err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while fetching cities.', 0);
      }
    });
  }

  // --- Filter Methods ---
  applyFilter() {
    const filters = this.filterForm.value;

    this.filteredCities = this.citiesList.filter(city => {
      let matchesCity = true;
      let matchesState = true;
      let matchesStatus = true;

      if (filters.cityName) {
        matchesCity = city.cityName.toLowerCase().includes(filters.cityName.toLowerCase());
      }

      if (filters.stateName) {
        matchesState = city.stateName === filters.stateName;
      }

      // Strict check for status because false is a valid value
      if (filters.status !== null && filters.status !== undefined && filters.status !== '') {
        matchesStatus = city.isActive === filters.status;
      }

      return matchesCity && matchesState && matchesStatus;
    });
  }

  clearFilter() {
    this.filterForm.reset();
    this.filteredCities = [...this.citiesList];
  }

  // Existing methods below
  addSupplier(data: any) {
    const dialogRef = this.dialog.open(AddCityComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllCities();
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
        this.setupservice.toggleCity(item).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message || 'Status toggled successfully', 1);
            } else {
              this.alertService.createAlert(res.message || 'Failed to toggle status', 0);
            }
          },
          error: (err) => {
            console.error('Error toggling status', err);
            this.alertService.createAlert(err.error?.message || 'An error occurred.', 0);
          }
        });
      }
    });
  }

  deleteRecord(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      autoFocus: false,
      data: { title: 'Delete Confirmation', content: `Are you sure you want to delete "${item.cityName}"?`, isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = {
          ...item,
          deletedBy: 1
        };

        this.setupservice.deleteCity(payload).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              this.alertService.createAlert(res.message || 'City deleted successfully', 1);
              this.getAllCities();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete city', 0);
            }
          },
          error: (err) => {
            console.error('Error deleting city', err);
            this.alertService.createAlert(err.error?.message || 'An error occurred while deleting.', 0);
          }
        });
      }
    });
  }
}