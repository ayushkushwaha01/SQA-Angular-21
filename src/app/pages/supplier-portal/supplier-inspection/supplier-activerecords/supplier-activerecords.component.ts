import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AddRecordPopComponent } from 'src/app/pages/internal-portal/inspection/add-record-pop/add-record-pop.component';
import { DefectsPopComponent } from 'src/app/pages/internal-portal/inspection/inspection-datatable/defects-pop/defects-pop.component';
import { ActiveGridDialogComponent } from 'src/app/pages/internal-portal/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { InspectionService } from 'src/app/pages/internal-portal/inspection/inspection.service';
import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: false,
  selector: 'app-supplier-activerecords',
  templateUrl: './supplier-activerecords.component.html',
  styleUrls: ['./supplier-activerecords.component.scss']
})
export class SupplierActiverecordsComponent implements OnInit, AfterViewInit, OnDestroy {

  // Sticky Header state
  private rafId: number | null = null;
  private scrollContainer: HTMLElement | null = null;
  private onScrollHandler = () => {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateStickyHeader();
    });
  };

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ngx-charts Configuration
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

  // Grid Data
  inspectionData: any[] = [];
  pagedInspectionData: any[] = [];
  originalInspectionData: any[] = [];
  showFilter = false;

  pageIndex: number = 0;
  pageSize: number = 20;
  totalCount: number = 0;
  serverMode: boolean = false;
  private pagedUnsupported: boolean = false;
  private serverChartCounts: any = null;

  // Dynamic Option Lists for Dropdowns
  inspectors: string[] = [];
  partFamilies: string[] = [];
  partNames: string[] = [];
  batchNumbers: string[] = [];

  // Filter values
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
  isLoading: boolean = true;

  constructor(
    private dialog: MatDialog,
    private api: InspectionService,
    private setupService: SetupService,
    private partAuditService: PartAuditService,
    private alertService: AlertService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');
    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.loadLookupsInBackground();
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

  private fmtDate(d: any): string | null {
    if (!d) return null;
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  }

  private loadLookupsInBackground() {
    if (this.supplierMap.size === 0) {
      this.partAuditService.getSupplierDD().pipe(catchError(() => of(null))).subscribe((r: any) => {
        if (r && r.success && Array.isArray(r.data)) {
          this.suppliersList = r.data;
          r.data.forEach((s: any) => {
            const id = Number(s.supplierId ?? s.SupplierId ?? s.id);
            const name = s.supplierName ?? s.SupplierName ?? s.name;
            if (id && name) { this.supplierMap.set(id, name); }
          });
        }
      });
    }
    if (this.partIdMap.size === 0) {
      this.partAuditService.getPartDD().pipe(catchError(() => of(null))).subscribe((r: any) => {
        const rawParts = r?.data?.data || (Array.isArray(r?.data) ? r.data : []);
        if (Array.isArray(rawParts) && rawParts.length) {
          this.partsList = rawParts;
          rawParts.forEach((p: any) => {
            const id = Number(p.partMasterId ?? p.PartMasterId ?? p.id);
            const code = (p.partMasterCode ?? p.PartMasterCode ?? '').toString().trim().toLowerCase();
            const name = p.partMasterName ?? p.PartMasterName ?? p.name;
            if (id && name) { this.partIdMap.set(id, name); }
            if (code && name) { this.partCodeMap.set(code, name); }
          });
        }
      });
    }
  }

  private mapRows(list: any[]): any[] {
    return (list || []).map((item: any) => {
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
  }

  loadData() {
    if (this.pagedUnsupported) {
      this.loadDataLegacy();
      return;
    }

    this.isLoading = true;
    const supplierId = this.getSupplierId();

    this.api.getInspectionsPaged({
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      supplierId: supplierId > 0 ? supplierId : null,
      date: this.fmtDate(this.filterDate),
      inspector: this.filterInspector,
      partFamily: this.filterPartFamily,
      partName: this.filterPartName,
      partNumber: this.filterPartNumber?.trim(),
      batchNumber: this.filterBatchNumber
    }).pipe(finalize(() => { this.isLoading = false; })).subscribe({
      next: (res: any) => {
        if (!res || !res.success || res.totalCount === undefined) {
          this.pagedUnsupported = true;
          this.loadDataLegacy();
          return;
        }
        this.serverMode = true;
        this.totalCount = res.totalCount ?? 0;
        this.serverChartCounts = res.chartCounts || null;
        this.originalInspectionData = this.mapRows(res.data || []);
        this.inspectionData = [...this.originalInspectionData];
        this.pagedInspectionData = this.inspectionData;

        const fo = res.filterOptions;
        if (fo) {
          this.inspectors = fo.inspectors || [];
          this.partFamilies = fo.partFamilies || [];
          this.partNames = fo.partNames || [];
          this.batchNumbers = fo.batchNumbers || [];
        }

        this.updateChartData();
        setTimeout(() => this.updateStickyHeader(), 50);
      },
      error: () => {
        this.pagedUnsupported = true;
        this.loadDataLegacy();
      }
    });
  }

  private loadDataLegacy() {
    this.isLoading = true;
    const supplierId = this.getSupplierId();

    this.api.getAllInspections(supplierId).pipe(finalize(() => { this.isLoading = false; })).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.serverMode = false;
          this.serverChartCounts = null;
          this.originalInspectionData = this.mapRows(res.data || []);
          this.inspectionData = [...this.originalInspectionData];
          this.totalCount = this.inspectionData.length;
          this.updatePagedList();

          this.inspectors = Array.from(new Set(this.originalInspectionData.map(item => item.Inspector).filter(x => x && x !== 'N/A'))).sort();
          this.partFamilies = Array.from(new Set(this.originalInspectionData.map(item => item.PartFamily).filter(x => x && x !== 'N/A'))).sort();
          this.partNames = Array.from(new Set(this.originalInspectionData.map(item => item.PartName).filter(x => x && x !== 'N/A'))).sort();
          this.batchNumbers = Array.from(new Set(this.originalInspectionData.map(item => item.BatchNumber).filter(x => x && x !== 'N/A'))).sort();

          this.updateChartData();
          setTimeout(() => this.updateStickyHeader(), 50);
        }
      },
      error: (err: any) => {
        console.error('Failed to load inspections', err);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.serverMode) {
      this.loadData();
    } else {
      this.updatePagedList();
      setTimeout(() => this.updateStickyHeader(), 50);
    }
  }

  updatePagedList() {
    if (this.serverMode) {
      this.pagedInspectionData = this.inspectionData;
      return;
    }
    const start = this.pageIndex * this.pageSize;
    this.pagedInspectionData = this.inspectionData.slice(start, start + this.pageSize);
  }

  applyFilter() {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    if (this.serverMode) {
      this.loadData();
      return;
    }

    this.inspectionData = this.originalInspectionData.filter(item => {
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

      if (this.filterInspector && item.Inspector !== this.filterInspector) {
        return false;
      }

      if (this.filterPartFamily && item.PartFamily !== this.filterPartFamily) {
        return false;
      }

      if (this.filterPartName && item.PartName !== this.filterPartName) {
        return false;
      }

      if (this.filterPartNumber && !item.PartNumber.toLowerCase().includes(this.filterPartNumber.toLowerCase())) {
        return false;
      }

      if (this.filterBatchNumber && item.BatchNumber !== this.filterBatchNumber) {
        return false;
      }

      return true;
    });

    this.totalCount = this.inspectionData.length;
    this.updatePagedList();
    this.updateChartData();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  clearFilter() {
    this.filterDate = null;
    this.filterInspector = '';
    this.filterPartFamily = '';
    this.filterPartName = '';
    this.filterPartNumber = '';
    this.filterBatchNumber = '';
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    if (this.serverMode) {
      this.loadData();
      return;
    }

    this.inspectionData = [...this.originalInspectionData];
    this.totalCount = this.inspectionData.length;
    this.updatePagedList();
    this.updateChartData();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  // Dynamically calculate chart data based on serverChartCounts or inspectionData
  updateChartData() {
    if (this.serverMode && this.serverChartCounts) {
      const stg = this.serverChartCounts.stage || {};
      const pf = this.serverChartCounts.partFamily || {};
      const insp = this.serverChartCounts.inspector || {};
      this.first = Object.keys(stg).map(key => ({ name: key, value: stg[key] }));
      this.multi = Object.keys(pf).map(key => ({ name: key, value: pf[key] }));
      this.triple = Object.keys(insp).map(key => ({ name: key, value: insp[key] }));
      return;
    }

    const stageCounts: any = {};
    const familyCounts: any = {};
    const inspectorCounts: any = {};

    this.inspectionData.forEach(item => {
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
      familyCounts[item.PartFamily] = (familyCounts[item.PartFamily] || 0) + 1;
      inspectorCounts[item.Inspector] = (inspectorCounts[item.Inspector] || 0) + 1;
    });

    this.first = Object.keys(stageCounts).map(key => ({ name: key, value: stageCounts[key] }));
    this.multi = Object.keys(familyCounts).map(key => ({ name: key, value: familyCounts[key] }));
    this.triple = Object.keys(inspectorCounts).map(key => ({ name: key, value: inspectorCounts[key] }));
  }

  scrollLeft() { this.tableContainer?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' }); }
  scrollRight() { this.tableContainer?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' }); }

  addrecord(data: any) { this.dialog.open(AddRecordPopComponent, { width: '1200px', maxWidth: '90vw', height: 'auto', data }); }
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
    this.setupStickyHeader();
  }

  setupStickyHeader(): void {
    this.ngZone.runOutsideAngular(() => {
      this.scrollContainer = document.getElementById('main') || document.querySelector('mat-sidenav-content');
      if (this.scrollContainer) {
        this.scrollContainer.addEventListener('scroll', this.onScrollHandler, { passive: true });
      }
      window.addEventListener('scroll', this.onScrollHandler, { passive: true, capture: true });
      window.addEventListener('resize', this.onScrollHandler, { passive: true });
    });
    setTimeout(() => this.updateStickyHeader(), 100);
  }

  updateStickyHeader(): void {
    const container = document.getElementById('grid-table-container') || document.getElementById('table-responsive');
    if (!container) return;

    const table = (container.querySelector('.audit-table') || container.querySelector('.custom-grid-table')) as HTMLElement;
    const thead = container.querySelector('thead') as HTMLElement;
    if (!table || !thead) return;

    const rect = container.getBoundingClientRect();
    const theadHeight = thead.offsetHeight || 44;
    const navHeight = 56;

    const offset = navHeight - rect.top;
    const maxOffset = Math.max(0, rect.height - theadHeight);
    const translateY = Math.max(0, Math.min(offset, maxOffset));

    if (translateY > 0) {
      table.style.setProperty('--sticky-header-offset', `${Math.round(translateY)}px`);
      if (!thead.classList.contains('is-sticky')) {
        thead.classList.add('is-sticky');
      }
    } else {
      table.style.removeProperty('--sticky-header-offset');
      if (thead.classList.contains('is-sticky')) {
        thead.classList.remove('is-sticky');
      }
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.onScrollHandler);
    }
    window.removeEventListener('scroll', this.onScrollHandler, { capture: true } as any);
    window.removeEventListener('scroll', this.onScrollHandler);
    window.removeEventListener('resize', this.onScrollHandler);
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

        this.cdr.detectChanges();
        setTimeout(() => this.updateStickyHeader(), 50);
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

        this.cdr.detectChanges();
        setTimeout(() => this.updateStickyHeader(), 50);
      }

    });

  }
}
