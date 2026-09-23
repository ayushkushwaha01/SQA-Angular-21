import { Component, Inject, Optional, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommodityService } from '../../process-audits/paudits-setup/commodity-master/commodity.service';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { PartAuditService } from '../part-audit.service';

@Component({
  standalone: false,
  selector: 'app-new-audit',
  templateUrl: './new-audit.component.html',
  styleUrls: ['./new-audit.component.scss']
})
export class NewAuditComponent implements OnInit {

  isEditMode: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<NewAuditComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private alertService: AlertService,
    private _setupService: SetupService,
    private fb: FormBuilder,
    private api: CommodityService,
    private manageUsersService: ManageUsersService,
    private partAuditService: PartAuditService
  ) { }

  ngOnInit(): void {
    console.log('Received data:', this.data);
    this.isEditMode = !!this.data?.partAuditId;
    this.formInit(this.data);
    this.getPartsFamilies();
    this.getCommodities();
    this.getSuppliers();
    this.getStates();
    this.getCities();
    this.getAuditors();
    this.getParts();
    if (this.isEditMode) {
      this.myGroup.get('partFamilyId')?.disable();
      this.myGroup.get('partMasterId')?.disable();
    }
  }

  noPartFamiliesFound = false;
  noPartsFound = false;
  noSuppliersFound = false;


  partsFamilies: any[] = [];
  // getPartsFamilies() {
  //   this._setupService.getPartFamilies(null)
  //     .subscribe((res: any) => {
  //       if (res.success) {

  //         this.partsFamilies = res.data.data;

  //       }
  //     });
  // }

  allPartFamilies: any[] = [];        // All Part Families
  // Filtered Part Families

  allParts: any[] = [];               // All Parts
  // Filtered Parts
  getPartsFamilies() {
    this._setupService.getPartFamilies(null)
      .subscribe((res: any) => {
        if (res.success) {

          this.allPartFamilies = res.data.data;
          this.partsFamilies = [...this.allPartFamilies];

        }
      });
  }

  parts: any[] = [];
  // getParts() {
  //   this._setupService.getPartMaster(null)
  //     .subscribe((res: any) => {
  //       if (res.success) {

  //         this.parts = res.data.data;

  //       }
  //     });
  // }
  getParts() {
    this._setupService.getPartMaster(null)
      .subscribe((res: any) => {
        if (res.success) {

          this.allParts = res.data.data;
          this.parts = [...this.allParts];
          if (this.isEditMode && this.data?.partMasterId && this.Suppliers.length > 0) {
            this.onPartChange(this.data.partMasterId);
            this.myGroup.get('supplierId')?.setValue(this.data.supplierId);
          }

        }
      });
  }
  // previous one
  // onCommodityChange(commodityId: number) {

  //   this.myGroup.patchValue({
  //     partFamilyId: null,
  //     partMasterId: null
  //   });

  //   // Filter parts by commodity
  //   const filteredParts = this.allParts.filter(
  //     x => x.commodityId == commodityId
  //   );

  //   // Build unique Part Family list
  //   this.partsFamilies = filteredParts.filter(
  //     (item, index, self) =>
  //       index === self.findIndex(
  //         x => x.partFamilyId === item.partFamilyId
  //       )
  //   );

  //   // Clear Part dropdown
  //   this.parts = [];
  // }
  // onPartFamilyChange(partFamilyId: number) {

  //   this.myGroup.patchValue({
  //     partMasterId: null
  //   });

  //   this.parts = this.allParts.filter(
  //     x => x.partFamilyId == partFamilyId
  //   );

  // }

  onCommodityChange(commodityId: number) {

    this.myGroup.patchValue({
      partFamilyId: null,
      partMasterId: null,
      supplierId: null
    });

    this.noPartFamiliesFound = false;
    this.noPartsFound = false;
    this.noSuppliersFound = false;

    const filteredParts = this.allParts.filter(
      x => x.commodityId == commodityId
    );

    this.partsFamilies = filteredParts.filter(
      (item, index, self) =>
        index === self.findIndex(
          x => x.partFamilyId === item.partFamilyId
        )
    );

    // Check whether Part Families exist
    this.noPartFamiliesFound = this.partsFamilies.length === 0;

    // Clear dependent dropdowns
    this.parts = [];
    this.filteredSuppliers = [];
  }

  onPartFamilyChange(partFamilyId: number) {

    this.myGroup.patchValue({
      partMasterId: null,
      supplierId: null
    });

    this.noPartsFound = false;
    this.noSuppliersFound = false;

    this.parts = this.allParts.filter(
      x => x.partFamilyId == partFamilyId
    );

    // Check whether Parts exist
    this.noPartsFound = this.parts.length === 0;

    // Clear suppliers
    this.filteredSuppliers = [];
  }
  originalTableData: any[] = [];
  getCommodities() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) {
        this.originalTableData = res.data;

      }
    });
  }

  Suppliers: any[] = [];
  getSuppliers() {
    this.partAuditService.getSupplierDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.Suppliers = res.data;
          if (this.isEditMode && this.data?.partMasterId && this.allParts.length > 0) {
            this.onPartChange(this.data.partMasterId);
            this.myGroup.get('supplierId')?.setValue(this.data.supplierId);
          }


        }
      });
  }


  filteredSuppliers: any[] = [];



  // onPartChange(partMasterId: number) {

  //   const selectedPart = this.allParts.find(x => x.partMasterId == partMasterId);

  //   if (!selectedPart || !selectedPart.supplierIds) {
  //     this.filteredSuppliers = [];
  //     return;
  //   }

  //   const supplierIds = selectedPart.supplierIds
  //     .split(',')
  //     .map((x: string) => Number(x));

  //   this.filteredSuppliers = this.Suppliers.filter(s =>
  //     supplierIds.includes(s.supplierId)
  //   );
  // }
  onPartChange(partMasterId: number) {

    this.myGroup.patchValue({
      supplierId: null
    });

    this.noSuppliersFound = false;

    const selectedPart = this.allParts.find(
      x => x.partMasterId == partMasterId
    );

    if (!selectedPart || !selectedPart.supplierIds) {
      this.filteredSuppliers = [];
      this.noSuppliersFound = true;
      return;
    }

    const supplierIds = selectedPart.supplierIds
      .split(',')
      .map((x: string) => Number(x));

    this.filteredSuppliers = this.Suppliers.filter(s =>
      supplierIds.includes(s.supplierId)
    );

    // Check whether Suppliers exist
    this.noSuppliersFound = this.filteredSuppliers.length === 0;
  }
  states: any[] = []
  getStates() {
    this.partAuditService.getStateDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.states = res.data;

        }
      });
  }


  cities: any[] = []
  allCities: any[] = [];
  getCities() {
    this.partAuditService.getCityDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.allCities = res.data;
          this.cities = [...this.allCities];

        }
      });
  }

  onStateChange(stateId: number) {

    this.myGroup.patchValue({
      cityId: null
    });

    this.cities = this.allCities.filter(
      x => x.stateId == stateId
    );

  }
  Auditors: any[] = [];

  getAuditors() {
    this.partAuditService.getAuditorDD()
      .subscribe((res: any) => {
        if (res.success) {
          this.Auditors = res.data;
          //this.Auditors = res.data.data.filter((user: any) => user.isAuditor === true);
        }
      });
  }


  // myGroup!: FormGroup;

  // formInit(data: any) {

  //   this.myGroup = this.fb.group({
  //     PartAuditId: [
  //       data?.partAuditId || 0
  //     ],


  //     PartMasterId: [
  //       data?.partMasterId || 0
  //     ],

  //     PartFamilyId: [
  //       data?.partFamilyId || null,
  //       Validators.required
  //     ],


  //     CommodityId: [
  //       data?.commodityId || null,
  //       Validators.required
  //     ],
  //     SupplierId: [
  //       data?.supplierId || null,
  //       Validators.required
  //     ],

  //     StateId: [
  //       data?.stateId || null,
  //       Validators.required
  //     ],
  //     CityId: [
  //       data?.cityId || null,
  //       Validators.required
  //     ],

  //     userId: [
  //       data?.AuditorId || null,
  //       Validators.required
  //     ],
  //     AuditDate: [
  //       data?.AuditDate || null,
  //       Validators.required
  //     ],
  //     Remakrs: [data?.Remakrs || '']
  //   });
  // }
  myGroup!: FormGroup;

  formInit(data: any) {
    this.myGroup = this.fb.group({

      partAuditId: [data?.partAuditId || 0],

      commodityId: [
        data?.commodityId || null,
        Validators.required
      ],

      partFamilyId: [
        data?.partFamilyId || null,
        Validators.required
      ],

      partMasterId: [
        data?.partMasterId || null,
        Validators.required
      ],

      supplierId: [
        data?.supplierId || null,
        Validators.required
      ],

      stateId: [
        data?.stateId || null,
        Validators.required
      ],

      cityId: [
        data?.cityId || null,
        Validators.required
      ],

      auditorId: [
        data?.auditorId || null,
        Validators.required
      ],

      auditDate: [
        data?.auditDate || null,
        Validators.required
      ],

      remakrs: [
        data?.remakrs || ''
      ],
      statusId: [data?.statusId ?? null]


    });

  }

  get f() {
    return this.myGroup.controls;
  }

  UpsertPartAudit(): void {

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }
    this.myGroup.get('partFamilyId')?.enable();
    this.myGroup.get('partMasterId')?.enable();
    const payload = { ...this.myGroup.value };

    if (payload.auditDate) {
      const date = new Date(payload.auditDate);

      payload.auditDate =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }


    this.partAuditService.upsertPartAudit(payload)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true);

          } else {

            this.alertService.createAlert(res.message, 0);

          }

        },

        error: (err) => {

          console.error(err);
          this.alertService.createAlert('Something went wrong.', 0);

        }

      });

  }


  close(): void {
    this.dialogRef.close();
  }

  selectedFiles: File[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).style.borderColor = '#b5b5b5';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).style.borderColor = '#b5b5b5';

    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  addFiles(files: FileList): void {
    Array.from(files).forEach(f => {
      if (!this.selectedFiles.find(x => x.name === f.name)) {
        this.selectedFiles.push(f);
      }
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

}