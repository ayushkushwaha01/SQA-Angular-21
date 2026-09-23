import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DefectsPopComponent } from '../inspection-datatable/defects-pop/defects-pop.component';
import { AddRecordPopComponent } from '../add-record-pop/add-record-pop.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { InspectionService } from '../inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { PageEvent } from '@angular/material/paginator';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { PartAuditService } from '../../parts-audits/part-audit.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-inspection-archives',
  templateUrl: './inspection-archives.component.html',
  styleUrls: ['./inspection-archives.component.scss'],
  providers: [DatePipe] // Provide DatePipe for formatting dates
})
export class InspectionArchivesComponent implements OnInit {

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  mockdata: any[] = [];
  pagedMockdata: any[] = [];
  pageSize = 20;
  pageIndex = 0;
  totalSize = 0;
  allMockData: any[] = [];
  showFilter = true;
  filterToggle: boolean = false;
  myGroup!: FormGroup;

  // Filter Arrays for UI
  inspectors: string[] = [];
  partFamilies: string[] = [];
  partNames: string[] = [];
  filteredPartNames: string[] = [];
  batchNumbers: string[] = [];
  partNameSearch = '';
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadCAPAScreen: boolean = false;
  readonly SCREEN_ID: number = 30;
  readonly SCREEN_IDd: number = 42;
  supplierMap: Map<number, string> = new Map();
  suppliersList: any[] = [];
  partIdMap: Map<number, string> = new Map();
  partCodeMap: Map<string, string> = new Map();
  partsList: any[] = [];
  isLoading: boolean = true;

  constructor(
    private dialog: MatDialog,
    private inspectionService: InspectionService,
    private setupService: SetupService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private partAuditService: PartAuditService
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.canreadCAPAScreen = UserPermissionService.fnGetReadPermissions(this.SCREEN_IDd);

    // Initialize the form group to prevent HTML errors
    this.myGroup = new FormGroup({
      date: new FormControl(null),
      inspector: new FormControl(''),
      partFamily: new FormControl(''),
      partName: new FormControl(''),
      partNumber: new FormControl(''),
      batchNumber: new FormControl('')
    });
    this.loadData();
    this.loadGridColumns();
  }

  // --- API INTEGRATION ---
  loadData() {
    this.isLoading = true;
    const suppliers$ = this.supplierMap.size > 0
      ? of({ success: true, data: this.suppliersList })
      : this.setupService.getAllSuppliers().pipe(catchError(() => of({ success: false, data: [] })));

    const parts$ = this.partIdMap.size > 0
      ? of({ success: true, data: { data: this.partsList } })
      : this.setupService.getPartMaster({ Keyword: '', Status: '' }).pipe(catchError(() => of({ success: false, data: [] })));

    forkJoin({
      res: this.inspectionService.getAllArchived(),
      suppliersRes: suppliers$,
      partsRes: parts$
    }).subscribe({
      next: ({ res, suppliersRes, partsRes }: any) => {
        if (suppliersRes && suppliersRes.success && Array.isArray(suppliersRes.data)) {
          this.suppliersList = suppliersRes.data;
          suppliersRes.data.forEach((s: any) => {
            const id = Number(s.supplierId ?? s.SupplierId ?? s.id);
            const name = s.supplierName ?? s.SupplierName ?? s.name;
            if (id && name) {
              this.supplierMap.set(id, name);
            }
          });
        }

        const rawParts = partsRes?.data?.data || (Array.isArray(partsRes?.data) ? partsRes.data : []);
        if (Array.isArray(rawParts) && rawParts.length) {
          this.partsList = rawParts;
          rawParts.forEach((p: any) => {
            const id = Number(p.partMasterId ?? p.PartMasterId ?? p.id);
            const code = (p.partMasterCode ?? p.PartMasterCode ?? '').toString().trim().toLowerCase();
            const name = p.partMasterName ?? p.PartMasterName ?? p.name;
            if (id && name) {
              this.partIdMap.set(id, name);
            }
            if (code && name) {
              this.partCodeMap.set(code, name);
            }
          });
        }

        if (res && res.success) {
          this.allMockData = res.data.map((item: any) => {
            const sId = Number(item.supplierId ?? item.SupplierId);
            const directName = item.supplierName || item.SupplierName || item.supplier || item.Supplier || item.supplierMasterName;
            const supplierName = (directName && directName !== '-') ? directName : (sId ? this.supplierMap.get(sId) : null) || '-';

            const pmId = Number(item.partMasterId ?? item.PartMasterId ?? item.partCodeId ?? item.PartCodeId ?? item.partId ?? item.PartId);
            const pmCode = (item.partMasterCode || item.PartMasterCode || '').toString().trim();
            const pmCodeLower = pmCode.toLowerCase();

            const directPartName = item.partMasterName || item.PartMasterName || item.partName || item.PartName;
            const resolvedPartName = (directPartName && directPartName !== '-')
              ? directPartName
              : ((pmId ? this.partIdMap.get(pmId) : null)
                || (pmCodeLower ? this.partCodeMap.get(pmCodeLower) : null)
                || pmCode
                || '-');

            return {
              id: item.inspectionId || item.InspectionId,
              Reference: item.referenceId || item.ReferenceId,
              Publish: item.publish ?? item.Publish ?? false,
              InspectionDate: item.inspectionDate || item.InspectionDate ? this.datePipe.transform(item.inspectionDate || item.InspectionDate, 'dd/MM/yyyy') : '-',
              Time: item.time || item.Time,
              Inspector: item.inspectorName || item.InspectorName || '-',
              Supplier: supplierName,
              PartFamily: item.partFamilyName || item.PartFamilyName || '-',
              PartName: resolvedPartName,
              PartNumber: item.partMasterCode || item.PartMasterCode || '-',
              Defects: item.defects || item.Defects || '0/0',
              Parameters: item.parameters || item.Parameters || '0',
              Remarks: item.remarks || item.Remarks || '-',
              BatchNumber: item.batchNumber || item.BatchNumber || '-',
              BatchQuantity: item.batchQuantity || item.BatchQuantity || 0,
              SampleQuantity: item.sampleQuantity || item.SampleQuantity || 0,
              ErrorRatePct: item.errorRate || item.ErrorRate || '0.00%',
              ErrorRatePPM: item.errorRatePPM || item.ErrorRatePPM || '0',
              stageId: item.stageId || item.StageId,
              supplierId: item.supplierId || item.SupplierId,
              shiftId: item.shiftId || item.ShiftId,
              inspectorId: item.inspectorId || item.InspectorId,
              partFamilyId: item.partFamilyId ?? item.PartFamilyId,
              partMasterId: item.partMasterId ?? item.PartMasterId ?? item.partCodeId ?? item.PartCodeId ?? item.partId ?? item.PartId,
              batchId: item.batchId ?? item.BatchId ?? item.batchNumberId ?? item.BatchNumberId
            };
          });

          this.mockdata = [...this.allMockData];
          this.populateFilterDropdowns();
          this.pageIndex = 0;
          this.updatePagedList();
          this.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load archived records', err);
        this.mockdata = [];
        this.allMockData = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  populateFilterDropdowns() {
    this.inspectors = Array.from(new Set(this.allMockData.map(item => item.Inspector).filter(item => item && item !== '-'))).sort();
    this.partFamilies = Array.from(new Set(this.allMockData.map(item => item.PartFamily).filter(item => item && item !== '-'))).sort();
    this.partNames = Array.from(new Set(this.allMockData.map(item => item.PartName).filter(item => item && item !== '-'))).sort();
    this.filteredPartNames = [...this.partNames];
    this.batchNumbers = Array.from(new Set(this.allMockData.map(item => item.BatchNumber).filter(item => item && item !== '-'))).sort();
  }

  filterPartNames(search: string) {
    this.partNameSearch = search;
    const term = search.toLowerCase().trim();
    this.filteredPartNames = this.partNames.filter(name => name.toLowerCase().includes(term));
  }

  // --- ACTIONS ---

  togglePublish(item: any) {
    if (!item.id) {
      this.alertService.createAlert("Error: Inspection ID is missing.", 0);
      item.Publish = !item.Publish; // Revert
      return;
    }

    this.inspectionService.togglePublish(item.id, item.Publish).subscribe({
      next: (res) => {
        this.alertService.createAlert(`Record ${item.Publish ? 'published' : 'unpublished'} successfully!`, 1);
      },
      error: (err) => {
        this.alertService.createAlert('Failed to update publish status.', 0);
        item.Publish = !item.Publish; // Revert checkbox if API fails
        this.cdr.detectChanges();
      }
    });
  }

  openEditDialog(item: any) {
    const dialogRef = this.dialog.open(AddRecordPopComponent, { width: '1000px', height: 'auto', data: item });
    dialogRef.afterClosed().subscribe(res => {
      if (res) this.loadData();
    });
  }

  openDefectsPop(item: any) {
    const dialogRef = this.dialog.open(DefectsPopComponent, { width: '1400px', height: 'auto', data: item });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.alertService.createAlert('Defects saved successfully!', 1);
        this.loadData();
      }
    });
  }

  deleteConfirmation(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to permanently delete this record?', confirmText: 'Delete' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inspectionService.deleteInspection(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('Record deleted successfully!', 1);
              this.loadData();
            }
          },
          error: (err) => this.alertService.createAlert('Failed to delete record', 0)
        });
      }
    });
  }

  unarchiveRecord(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Unarchive Confirmation', content: 'Are you sure you want to unarchive this record and return it to Active status?', confirmText: 'Unarchive' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Calling the toggle archive endpoint to restore it
        this.inspectionService.archiveInspection(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('Record unarchived successfully!', 1);
              this.loadData();
            }
          },
          error: (err) => this.alertService.createAlert('Failed to unarchive record', 0)
        });
      }
    });
  }

  // --- UI Scrolling & Filtering ---
  scrollLeft() {
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  processgrid() {
    // Implement grid column toggling if needed
  }

  updatePagedList() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedMockdata = this.mockdata.slice(startIndex, endIndex);
    this.totalSize = this.mockdata.length;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedList();
  }

  clearFilter() {
    this.myGroup.reset({
      inspectionDate: '',
      inspector: '',
      partFamily: '',
      partName: '',
      partNumber: '',
      batchNumber: ''
    });
    this.partNameSearch = '';
    this.filteredPartNames = [...this.partNames];
    this.mockdata = [...this.allMockData];
    this.pageIndex = 0;
    this.updatePagedList();
  }

  go() {
    const filters = this.myGroup.value;
    const dateVal = filters.inspectionDate;
    const inspectorVal = filters.inspector;
    const partFamilyVal = filters.partFamily;
    const partNameVal = filters.partName;
    const partNumberVal = filters.partNumber ? filters.partNumber.toLowerCase().trim() : '';
    const batchNumberVal = filters.batchNumber;

    this.mockdata = this.allMockData.filter(item => {
      let isMatch = true;

      // 1. Date filter (item.InspectionDate is string in 'dd/MM/yyyy' format)
      if (dateVal) {
        if (!item.InspectionDate || item.InspectionDate === '-') {
          isMatch = false;
        } else {
          const parsedFilterDate = this.datePipe.transform(new Date(dateVal), 'dd/MM/yyyy');
          if (item.InspectionDate !== parsedFilterDate) {
            isMatch = false;
          }
        }
      }

      // 2. Inspector
      if (inspectorVal) {
        isMatch = isMatch && item.Inspector === inspectorVal;
      }

      // 3. Part Family
      if (partFamilyVal) {
        isMatch = isMatch && item.PartFamily === partFamilyVal;
      }

      // 4. Part Name
      if (partNameVal) {
        isMatch = isMatch && item.PartName === partNameVal;
      }

      // 5. Part Number
      if (partNumberVal) {
        isMatch = isMatch && !!(item.PartNumber && item.PartNumber.toLowerCase().includes(partNumberVal));
      }

      // 6. Batch Number
      if (batchNumberVal) {
        isMatch = isMatch && item.BatchNumber === batchNumberVal;
      }

      return isMatch;
    });

    this.pageIndex = 0;
    this.updatePagedList();
  }

  defaultColumns: string[] = [
    'Actions',
    'Reference',
    'Publish',
    'Inspection Date',
    'Time',
    'Inspector',
    'Supplier',
    'Part Family',
    'Part Name',
    // 'Part Number',
    'Defects',
    'Parameters',
    'Remarks',
    'Batch Number',
    'Batch Qty',
    'Sample Qty',
    'Error Rate (%)',
    'Error Rate (PPM)'
  ];

  activeColumns: string[] = [];

  frozenCount = 0;

  getColumnWidth(column: string): number {
    const widths: { [key: string]: number } = {
      'Actions': 100,
      'Reference': 180,
      'Publish': 100,
      'Inspection Date': 150,
      'Time': 120,
      'Inspector': 180,
      'Supplier': 180,
      'Part Family': 180,
      'Part Name': 180,
      'Part Number': 160,
      'Defects': 120,
      'Parameters': 150,
      'Remarks': 200,
      'Batch Number': 150,
      'Batch Qty': 120,
      'Sample Qty': 120,
      'Error Rate (%)': 150,
      'Error Rate (PPM)': 160
    };
    return widths[column] || 150;
  }

  getStickyLeft(index: number): string {
    let left = 0;
    for (let i = 0; i < index; i++) {
      left += this.getColumnWidth(this.activeColumns[i]);
    }
    return left + 'px';
  }

  openColumnSelector() {
    const dialogRef = this.dialog.open(ColumnSelectorComponent, {
      width: '750px',
      height: 'auto',
      disableClose: true,
      data: {
        userId: 1, // replace with logged-in user ID
        gridType: 'InspectionArchivedTable',
        defaultColumns: this.defaultColumns
      }
    });

    dialogRef.afterClosed().subscribe((didSave: boolean) => {
      if (didSave) {
        this.alertService.createAlert('Column layout updated successfully.');
        this.loadGridColumns();
      }
    });
  }

  loadGridColumns() {
    const filter = {
      userId: 1, // replace with logged-in user ID
      gridType: 'InspectionArchivedTable'
    };

    this.partAuditService.getgridcolumns(filter).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const parsedData = JSON.parse(res.data.selectedColumnsJSON);
          if (Array.isArray(parsedData)) {
            this.activeColumns = parsedData;
            this.frozenCount = 0;
          } else {
            this.activeColumns = parsedData.columns || [...this.defaultColumns];
            this.frozenCount = parsedData.frozenCount || 0;
          }
        } else {
          this.activeColumns = [...this.defaultColumns];
          this.frozenCount = 0;
        }
      },
      error: (error) => {
        console.error('Error loading grid columns', error);
        this.activeColumns = [...this.defaultColumns];
        this.frozenCount = 0;
      }
    });
  }
}