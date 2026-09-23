import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRecordPopComponent } from 'src/app/pages/internal-portal/inspection/add-record-pop/add-record-pop.component';
import { DefectsPopComponent } from 'src/app/pages/internal-portal/inspection/inspection-datatable/defects-pop/defects-pop.component';
import { ActiveGridDialogComponent } from 'src/app/pages/internal-portal/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { InspectionService } from 'src/app/pages/internal-portal/inspection/inspection.service'; // Ensure correct path
import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: false,
  selector: 'app-supplier-activerecords',
  templateUrl: './supplier-activerecords.component.html',
  styleUrls: ['./supplier-activerecords.component.scss']
})
export class SupplierActiverecordsComponent implements OnInit {

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ ngx-charts Configuration ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  public first: any[] = []; // Inspection by Stage
  public multi: any[] = []; // Distribution by Part Family
  public triple: any[] = []; // By Inspector

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

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Grid Data ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  inspectionData: any[] = [];
  originalInspectionData: any[] = [];
  showFilter = false;

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Dynamic Option Lists for Dropdowns ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  inspectors: string[] = [];
  partFamilies: string[] = [];
  partNames: string[] = [];
  batchNumbers: string[] = [];

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Filter values ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  filterDate: any = null;
  filterInspector: string = '';
  filterPartFamily: string = '';
  filterPartName: string = '';
  filterPartNumber: string = '';
  filterBatchNumber: string = '';

  supplierMap: Map<number, string> = new Map();
  suppliersList: any[] = [];
  partIdMap: Map<number, string> = new Map();
  partCodeMap: Map<string, string> = new Map();
  partsList: any[] = [];

  constructor(
    private dialog: MatDialog,
    private api: InspectionService,
    private setupService: SetupService,
    private partAuditService: PartAuditService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadGridColumns();
  }

private getSupplierId(): number {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
          || decoded.nameid
          || decoded.SupplierId
          || decoded.supplierId
          || decoded.UserId
          || decoded.userId
          || decoded.sub;
        if (id && Number(id) > 0) {
          return Number(id);
        }
      } catch (err) {
        console.error('Error decoding token for supplierId:', err);
      }
    }
    const localSuppId = localStorage.getItem('SupplierId') || localStorage.getItem('UserId') || sessionStorage.getItem('SupplierId') || sessionStorage.getItem('UserId');
    return Number(localSuppId) || 0;
  }

  loadData() {
    const supplierId = this.getSupplierId();

    const suppliers$ = this.supplierMap.size > 0
      ? of({ success: true, data: this.suppliersList })
      : this.setupService.getAllSuppliers().pipe(catchError(() => of({ success: false, data: [] })));

    const parts$ = this.partIdMap.size > 0
      ? of({ success: true, data: { data: this.partsList } })
      : this.setupService.getPartMaster({ Keyword: '', Status: '' }).pipe(catchError(() => of({ success: false, data: [] })));

    forkJoin({
      res: this.api.getAllInspections(supplierId),
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

        if (res.success) {
          this.originalInspectionData = res.data.map((item: any) => {
            const rawErrorRateStr = item.errorRate || '0';
            const parsedErrorRate = parseFloat(rawErrorRateStr.toString().replace('%', ''));
            const errorRatePpmVal = isNaN(parsedErrorRate) ? 0 : (parsedErrorRate * 1000);

            const sId = Number(item.supplierId ?? item.SupplierId);
            const directName = item.supplierName || item.SupplierName || item.supplier || item.Supplier || item.supplierMasterName;
            const supplierName = (directName && directName !== '-' && directName !== 'N/A') ? directName : (sId ? this.supplierMap.get(sId) : null) || 'N/A';

            const pmId = Number(item.partMasterId ?? item.PartMasterId ?? item.partCodeId ?? item.PartCodeId ?? item.partId ?? item.PartId);
            const pmCode = (item.partMasterCode || item.PartMasterCode || '').toString().trim();
            const pmCodeLower = pmCode.toLowerCase();

            const directPartName = item.partMasterName || item.PartMasterName || item.partName || item.PartName;
            const resolvedPartName = (directPartName && directPartName !== '-' && directPartName !== 'N/A')
              ? directPartName
              : ((pmId ? this.partIdMap.get(pmId) : null)
                || (pmCodeLower ? this.partCodeMap.get(pmCodeLower) : null)
                || pmCode
                || 'N/A');

            return {
              id: item.inspectionId,
              Reference: item.referenceId,
              Publish: item.publish,
              InspectionDate: item.inspectionDate ? new Date(item.inspectionDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
              Time: item.time || '-',
              Inspector: item.inspectorName || 'N/A',
              Supplier: supplierName,
              PartFamily: item.partFamilyName || 'N/A',
              PartName: resolvedPartName,
              PartNumber: item.partMasterCode || 'N/A',
              Defects: item.defects,
              Parameters: item.parameters,
              Remarks: item.remarks || '-',
              BatchNumber: item.batchNumber || 'N/A',
              BatchQuantity: item.batchQuantity || 0,
              SampleQuantity: item.sampleQuantity || 0,
              ErrorRatePct: rawErrorRateStr.toString().includes('%') ? rawErrorRateStr : `${rawErrorRateStr}%`,
              ErrorRatePPM: errorRatePpmVal,
              stage: item.stageName || 'N/A'
            };
          });
          this.inspectionData = [...this.originalInspectionData];

        // Populate dynamic lists (excluding duplicates and N/A values)
        this.inspectors = Array.from(new Set(this.originalInspectionData.map(item => item.Inspector).filter(x => x && x !== 'N/A'))).sort();
        this.partFamilies = Array.from(new Set(this.originalInspectionData.map(item => item.PartFamily).filter(x => x && x !== 'N/A'))).sort();
        this.partNames = Array.from(new Set(this.originalInspectionData.map(item => item.PartName).filter(x => x && x !== 'N/A'))).sort();
        this.batchNumbers = Array.from(new Set(this.originalInspectionData.map(item => item.BatchNumber).filter(x => x && x !== 'N/A'))).sort();

          this.updateChartData();
        }
      },
      error: (err: any) => {
        console.error('Failed to load inspections', err);
      }
    });
  }

  applyFilter() {
    this.inspectionData = this.originalInspectionData.filter(item => {
      // 1. Inspection Date filter
      if (this.filterDate) {
        const fd = new Date(this.filterDate);
        const day = String(fd.getDate()).padStart(2, '0');
        const month = String(fd.getMonth() + 1).padStart(2, '0');
        const year = fd.getFullYear();
        const formattedFilterDate = `${day}-${month}-${year}`;
        if (item.InspectionDate !== formattedFilterDate) {
          return false;
        }
      }

      // 2. Inspector filter
      if (this.filterInspector && item.Inspector !== this.filterInspector) {
        return false;
      }

      // 3. Part Family filter
      if (this.filterPartFamily && item.PartFamily !== this.filterPartFamily) {
        return false;
      }

      // 4. Part Name filter
      if (this.filterPartName && item.PartName !== this.filterPartName) {
        return false;
      }

      // 5. Part Number filter (case-insensitive search)
      if (this.filterPartNumber && !item.PartNumber.toLowerCase().includes(this.filterPartNumber.toLowerCase())) {
        return false;
      }

      // 6. Batch Number filter
      if (this.filterBatchNumber && item.BatchNumber !== this.filterBatchNumber) {
        return false;
      }

      return true;
    });

    this.updateChartData();
  }

  clearFilter() {
    this.filterDate = null;
    this.filterInspector = '';
    this.filterPartFamily = '';
    this.filterPartName = '';
    this.filterPartNumber = '';
    this.filterBatchNumber = '';
    this.inspectionData = [...this.originalInspectionData];

    this.updateChartData();
  }

  // Dynamically calculate chart data based on inspectionData
  updateChartData() {
    const stageCounts: any = {};
    const familyCounts: any = {};
    const inspectorCounts: any = {};

    this.inspectionData.forEach(item => {
      // Count Stages
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
      // Count Part Families
      familyCounts[item.PartFamily] = (familyCounts[item.PartFamily] || 0) + 1;
      // Count Inspectors
      inspectorCounts[item.Inspector] = (inspectorCounts[item.Inspector] || 0) + 1;
    });

    // Map to ngx-charts format: { name: string, value: number }
    this.first = Object.keys(stageCounts).map(key => ({ name: key, value: stageCounts[key] }));
    this.multi = Object.keys(familyCounts).map(key => ({ name: key, value: familyCounts[key] }));
    this.triple = Object.keys(inspectorCounts).map(key => ({ name: key, value: inspectorCounts[key] }));
  }

  scrollLeft() { this.tableContainer?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' }); }
  scrollRight() { this.tableContainer?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' }); }

  addrecord(data: any) { this.dialog.open(AddRecordPopComponent, { width: '1000px', height: 'auto', data }); }
  openDefectsPop(item: any) { this.dialog.open(DefectsPopComponent, { width: '1400px', height: 'auto', data: { ...item, isReadOnly: true } }); }
  openEditDialog(item: any) { console.log('Edit clicked for:', item); }
  deleteConfirmation(item: any) { console.log('Delete clicked for:', item); }
  archiveRecord(item: any) { console.log('Archive clicked for:', item); }

  openGridView(data: any) {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  ngAfterViewInit(): void {
    // code after view initialization
  }

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
    'Part Number',
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

  frozenCount: number = 0;


  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Actions': 100,
      'Reference': 180,
      'Stage': 120,
      'Publish': 100,
      'Inspection Date': 150,
      'Time': 120,
      'Inspector': 160,
      'Supplier': 180,
      'Part Family': 180,
      'Part Name': 180,
      'Part Number': 160,
      'Defects': 120,
      'Parameters': 150,
      'Remarks': 180,
      'Batch Number': 150,
      'Batch Qty': 120,
      'Sample Qty': 120,
      'Error Rate (%)': 150,
      'Error Rate (PPM)': 170

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
        userId: 1, // Replace with logged-in user ID
        gridType: 'SupplierInspectionTable',
        defaultColumns: this.defaultColumns
      }

    });

    dialogRef.afterClosed().subscribe((didSave: boolean) => {

      if (didSave) {

        this.alertService.createAlert(
          'Column layout updated successfully.'
        );

        this.loadGridColumns();

      }

    });

  }


  loadGridColumns() {

    const filter = {
      userId: 1, // Replace with logged-in user ID
      gridType: 'SupplierInspectionTable'
    };

    this.partAuditService.getgridcolumns(filter).subscribe({

      next: (res: any) => {

        if (res.success && res.data) {

          const parsedData = JSON.parse(
            res.data.selectedColumnsJSON
          );

          // Old format support
          if (Array.isArray(parsedData)) {

            this.activeColumns = parsedData;
            this.frozenCount = 0;

          }
          else {

            this.activeColumns =
              parsedData.columns ||
              [...this.defaultColumns];

            this.frozenCount =
              parsedData.frozenCount || 0;

          }

        }
        else {

          this.activeColumns = [
            ...this.defaultColumns
          ];

          this.frozenCount = 0;

        }

      },

      error: (error: any) => {

        console.error(
          'Error loading grid columns',
          error
        );

        this.activeColumns = [
          ...this.defaultColumns
        ];

        this.frozenCount = 0;

      }

    });

  }
}