import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRecordPopComponent } from '../add-record-pop/add-record-pop.component';
import { DefectsPopComponent } from './defects-pop/defects-pop.component';
import { ActiveGridDialogComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { InspectionService } from '../inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { PartAuditService } from '../../parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date.toDateString();
  }
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Component({
  standalone: false,
  selector: 'app-inspection-datatable',
  templateUrl: './inspection-datatable.component.html',
  styleUrls: ['./inspection-datatable.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class InspectionDatatableComponent implements OnInit, AfterViewInit {

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  // ── ngx-charts Configuration ──
  public first: any[] = [];
  public multi: any[] = [];
  public triple: any[] = [];

  public showLegend = false;
  public showLabels = true;
  public explodeSlices = false;
  public doughnut = false;
  public gradient = false;
  public colorScheme: any = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B', '#0096A6', '#F47B00', '#606060']
  };

  public onSelect(event?: any) {
    console.log('Item clicked', event);
  }

  // --- Filter Variables ---
  allMockData: any[] = [];
  mockdata: any[] = [];
  pagedMockdata: any[] = [];
  pageSize = 20;
  pageIndex = 0;
  totalSize = 0;
  showFilter = false;

  inspectors: string[] = [];
  partFamilies: string[] = [];
  partNames: string[] = [];
  filteredPartNames: string[] = [];
  batchNumbers: string[] = [];
  partNameSearch = '';

  filterObj = {
    date: null as Date | null,
    inspector: '',
    partFamily: '',
    partName: '',
    partNumber: '',
    batchNumber: ''
  };

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadDashboard: boolean = false;
  readonly SCREEN_ID: number = 27;
  readonly SCREEN_IDd: number = 28;

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
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
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
    this.canreadDashboard = UserPermissionService.fnGetReadPermissions(this.SCREEN_IDd);
    this.loadData();
    this.loadGridColumns();
  }

  loadData() {
    this.isLoading = true;
    const suppliers$ = this.supplierMap.size > 0
      ? of({ success: true, data: this.suppliersList })
      : this.setupService.getAllSuppliers().pipe(catchError(() => of({ success: false, data: [] })));

    const parts$ = this.partIdMap.size > 0
      ? of({ success: true, data: { data: this.partsList } })
      : this.setupService.getPartMaster({ Keyword: '', Status: '' }).pipe(catchError(() => of({ success: false, data: [] })));

    forkJoin({
      res: this.inspectionService.getAllInspections(),
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

            // Safely parse the "50%" string into a number (50) for the PPM calculation
            const rawErrorRateStr = (item.errorRate ?? item.ErrorRate) || '0';
            const parsedErrorRate = parseFloat(rawErrorRateStr.toString().replace('%', ''));

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
              stageId: item.stageId || item.StageId,
              supplierId: item.supplierId || item.SupplierId,
              shiftId: item.shiftId || item.ShiftId,
              inspectorId: item.inspectorId || item.InspectorId,
              partFamilyId: item.partFamilyId ?? item.PartFamilyId,
              partMasterId: item.partMasterId ?? item.PartMasterId ?? item.partCodeId ?? item.PartCodeId ?? item.partId ?? item.PartId,
              batchId: item.batchId ?? item.BatchId ?? item.batchNumberId ?? item.BatchNumberId,
              Reference: item.referenceId || item.ReferenceId,
              Publish: item.publish ?? item.Publish ?? false,
              InspectionDate: item.inspectionDate || item.InspectionDate ? new Date(item.inspectionDate || item.InspectionDate).toISOString() : null,
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

              // Ensure percentage formatting is kept for the Pct column
              ErrorRatePct: rawErrorRateStr.toString().includes('%') ? rawErrorRateStr : `${rawErrorRateStr}%`,

              // Calculate PPM by multiplying the parsed number by 1000
              ErrorRatePPM: isNaN(parsedErrorRate) ? 0 : (parsedErrorRate * 1000),

              stage: item.stageName || item.StageName || 'Unassigned'
            };
          });

          this.mockdata = [...this.allMockData];
          this.populateFilterDropdowns();
          this.pageIndex = 0;
          this.updatePagedList();
          this.updateChartData();
          this.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load inspection records from API', err);
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

  applyFilter() {
    this.mockdata = this.allMockData.filter(item => {
      let matches = true;
      if (this.filterObj.date) {
        if (!item.InspectionDate) {
          matches = false;
        } else {
          const itemDate = new Date(item.InspectionDate).toDateString();
          const filterDate = new Date(this.filterObj.date).toDateString();
          if (itemDate !== filterDate) matches = false;
        }
      }
      if (this.filterObj.inspector && item.Inspector !== this.filterObj.inspector) matches = false;
      if (this.filterObj.partFamily && item.PartFamily !== this.filterObj.partFamily) matches = false;
      if (this.filterObj.partName && item.PartName !== this.filterObj.partName) matches = false;

      // New filters
      if (this.filterObj.partNumber && !item.PartNumber?.toLowerCase().includes(this.filterObj.partNumber.toLowerCase().trim())) matches = false;
      if (this.filterObj.batchNumber && item.BatchNumber !== this.filterObj.batchNumber) matches = false;

      return matches;
    });
    this.pageIndex = 0;
    this.updatePagedList();
    this.updateChartData();
  }

  clearFilter() {
    this.filterObj = { date: null, inspector: '', partFamily: '', partName: '', partNumber: '', batchNumber: '' };
    this.partNameSearch = '';
    this.filteredPartNames = [...this.partNames];
    this.mockdata = [...this.allMockData];
    this.pageIndex = 0;
    this.updatePagedList();
    this.updateChartData();
  }

  updateChartData() {
    const stageCounts: any = {};
    const familyCounts: any = {};
    const inspectorCounts: any = {};

    this.mockdata.forEach(item => {
      if (item.stage) stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
      if (item.PartFamily) familyCounts[item.PartFamily] = (familyCounts[item.PartFamily] || 0) + 1;
      if (item.Inspector) inspectorCounts[item.Inspector] = (inspectorCounts[item.Inspector] || 0) + 1;
    });

    this.first = Object.keys(stageCounts).map(key => ({ name: key, value: stageCounts[key] }));
    this.multi = Object.keys(familyCounts).map(key => ({ name: key, value: familyCounts[key] }));
    this.triple = Object.keys(inspectorCounts).map(key => ({ name: key, value: inspectorCounts[key] }));
  }

  scrollLeft() { this.tableContainer?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' }); }
  scrollRight() { this.tableContainer?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' }); }

  // -------------------------------------------------------------
  // ACTIONS (Add, Edit, Delete, Archive, Publish)
  // -------------------------------------------------------------

  addrecord(data: any) {
    const dialogRef = this.dialog.open(AddRecordPopComponent, { width: '1500px', height: 'auto', data: null });
    dialogRef.afterClosed().subscribe(res => { if (res) this.loadData(); });
  }

  openEditDialog(item: any) {
    const dialogRef = this.dialog.open(AddRecordPopComponent, { width: '1000px', height: 'auto', data: item });
    dialogRef.afterClosed().subscribe(res => { if (res) this.loadData(); });
  }

  deleteConfirmation(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: 'Are you sure you want to delete this record?',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inspectionService.deleteInspection(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('Record deleted successfully!');
              this.loadData();
            }
          },
          error: (err) => this.alertService.createAlert('Failed to delete record')
        });
      }
    });
  }

  archiveRecord(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Archive Confirmation',
        content: 'Are you sure you want to archive this record?',
        confirmText: 'Archive'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inspectionService.archiveInspection(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('Record archived successfully!');
              this.loadData();
            }
          },
          error: (err) => this.alertService.createAlert('Failed to archive record')
        });
      }
    });
  }

  togglePublish(item: any) {
    if (!item.id) {
      this.alertService.createAlert("Error: Inspection ID is missing."); // <-- Replace native alert
      item.Publish = !item.Publish; // Revert
      return;
    }

    this.inspectionService.togglePublish(item.id, item.Publish).subscribe({
      next: (res) => {
        this.alertService.createAlert(`Record ${item.Publish ? 'published' : 'unpublished'} successfully!`); // <-- Success Alert
      },
      error: (err) => {
        this.alertService.createAlert('Failed to update publish status. Check console for details.'); // <-- Error Alert
        console.error(err);
        item.Publish = !item.Publish; // Revert checkbox if API fails
        this.cdr.detectChanges();
      }
    });
  }

  openDefectsPop(item: any) {
    const dialogRef = this.dialog.open(DefectsPopComponent, { width: '1400px', height: 'auto', data: item });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.alertService.createAlert('Defects saved successfully!');
        this.loadData();
      }
    });
  }

  openGridView(data: any) {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  ngAfterViewInit(): void { }

  defaultColumns: string[] = [
    'Actions',
    'Reference',
    'Stage',
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
      'Actions': 120,
      'Reference': 180,
      'Stage': 120,
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
        gridType: 'InspectionActiveTable',
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
      gridType: 'InspectionActiveTable'
    };

    this.partAuditService.getgridcolumns(filter).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const parsedData = JSON.parse(res.data.selectedColumnsJSON);
          // Old format support
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