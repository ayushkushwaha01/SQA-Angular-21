import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { ActiveGridDialogComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { AuditDonePopupComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/audit-done-popup/audit-done-popup.component';
import { PartAuditService } from '../part-audit.service';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { CommodityService } from '../../process-audits/paudits-setup/commodity-master/commodity.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { NewAuditComponent } from '../new-audit/new-audit.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';

@Component({
  standalone: false,
  selector: 'app-parts-active-audits',
  templateUrl: './parts-active-audits.component.html',
  styleUrls: ['./parts-active-audits.component.scss']
})
export class PartsActiveAuditsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  Highcharts: typeof Highcharts = Highcharts;

  showFilters: boolean = false;

  currentPage: number = 0;
  totalSize: number = 0;
  // Server-side paging: true only when the API returns a partial page (fewer rows than totalRecords)
  serverMode: boolean = false;
  private serverCharts: any = null;
  fromIndex: number = 0;
  pageSize: number = 20;
  tableLists: any[] = [];
  isLoading: boolean = true;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadDashboard: boolean = false;
  readonly SCREEN_ID: number = 20;
  readonly SCREEN_IDd: number = 21;

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
    this.fomrInit();

    this.filterForm.get('done')?.valueChanges.subscribe(value => {
      setTimeout(() => {
        this.getPartsAuidt();
      });
    });

    this.getPartsAuidt();
    this.getLookups();
    this.getPartsFamilies();
    this.getParts();
    this.getCommodities();
    this.getSuppliers();
    this.getStates();
    this.getCities();
    this.getAuditors();
    this.loadGridColumns();
  }

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

  constructor(
    private dialog: MatDialog,
    private partAuditService: PartAuditService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private _setupService: SetupService,
    private api: CommodityService,
    private manageUsersService: ManageUsersService,
    private ngZone: NgZone
  ) { }

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
    const navHeight = 56; // Fixed black top navigation bar height

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

  filterForm!: FormGroup;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  fomrInit() {
    this.filterForm = this.fb.group({
      keyword: [''],
      commodityId: [null],
      partFamilyId: [null],
      partMasterId: [null],
      supplierId: [null],
      auditorId: [null],
      stateId: [null],
      cityId: [null],
      statusId: [null],
      fromDate: [null],
      toDate: [null],
      done: [false],
      Archive: [false]
    });
  }

  clearFilters() {
    this.filterForm.reset({
      keyword: '',
      commodityId: null,
      partFamilyId: null,
      partMasterId: null,
      supplierId: null,
      auditorId: null,
      stateId: null,
      cityId: null,
      statusId: null,
      fromDate: null,
      toDate: null,
      done: false,
      Archive: false
    });

    this.getPartsAuidt();
  }

  partsFamilies: any[] = [];
  getPartsFamilies() {
    this.partAuditService.getFamilyDD().subscribe((res: any) => {
      if (res.success) {
        this.partsFamilies = res.data;
      }
    });
  }

  parts: any[] = [];
  getParts() {
    this.partAuditService.getPartDD().subscribe((res: any) => {
      if (res.success) {
        this.parts = res.data;
      }
    });
  }

  originalTableData: any[] = [];
  getCommodities() {
    this.partAuditService.getCommodityDD().subscribe((res: any) => {
      if (res.success) {
        this.originalTableData = res.data;
      }
    });
  }

  Suppliers: any[] = [];
  getSuppliers() {
    this.partAuditService.getSupplierDD().subscribe((res: any) => {
      if (res.success) {
        this.Suppliers = res.data;
      }
    });
  }

  states: any[] = [];
  getStates() {
    this.partAuditService.getStateDD().subscribe((res: any) => {
      if (res.success) {
        this.states = res.data;
      }
    });
  }

  cities: any[] = [];
  getCities() {
    this.partAuditService.getCityDD().subscribe((res: any) => {
      if (res.success) {
        this.cities = res.data;
      }
    });
  }

  Auditors: any[] = [];
  getAuditors() {
    this.partAuditService.getAuditorDD().subscribe((res: any) => {
      if (res.success) {
        this.Auditors = res.data;
      }
    });
  }

  lookups: any[] = [];
  getLookups() {
    this.partAuditService.getAuditStatusDD().subscribe((res: any) => {
      if (res.success) {
        this.lookups = res.data;
      }
    });
  }

  partsAudits: any[] = [];
  getPartsAuidt(keepPage: boolean = false) {
    if (!keepPage) { this.currentPage = 0; this.fromIndex = 0; }
    const filter = { ...this.filterForm.value };

    Object.keys(filter).forEach(key => {
      if (
        filter[key] === null ||
        filter[key] === undefined ||
        filter[key] === ''
      ) {
        delete filter[key];
      }
    });

    this.isLoading = true;
    // Ask the server for a single page (older APIs ignore these and return everything -> client paging)
    filter.pageNumber = this.currentPage + 1;
    filter.pageSize = this.pageSize;
    this.partAuditService.getPartAudits(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.partsAudits = res.data.data;
          this.totalSize = res.data.toatalRecords;
          this.serverMode = !!res.data?.isPaged || !!res.data?.chartCounts || this.partsAudits.length < this.totalSize;
          this.serverCharts = res.data.chartCounts || null;
          if (this.serverMode) {
            this.tableLists = this.partsAudits;
          } else {
            this.fromIndex = this.currentPage * this.pageSize;
            this.tableLists = this.partsAudits.slice(this.fromIndex, this.fromIndex + this.pageSize);
          }
          this.loadCharts();
          setTimeout(() => this.updateStickyHeader(), 50);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadCharts() {
    // In server mode, charts use whole-dataset counts from the API when provided (otherwise current page only)
    const real = this.partsAudits;
    const sc = this.serverMode ? this.serverCharts : null;
    const expand = (counts: any, key: string) =>
      Object.keys(counts).reduce((acc: any[], k: string) => {
        for (let i = 0; i < counts[k]; i++) { acc.push({ [key]: k }); }
        return acc;
      }, []);
    this.partsAudits = sc?.commodity ? expand(sc.commodity, 'commodityName') : real;
    this.bindCommodityChart();
    this.partsAudits = sc?.auditor ? expand(sc.auditor, 'auditorName') : real;
    this.bindAuditorChart();
    this.partsAudits = sc?.status ? expand(sc.status, 'statusName') : real;
    this.bindStatusChart();
    this.partsAudits = real;
  }

  loadChartsFromRows() {
    this.bindCommodityChart();
    this.bindAuditorChart();
    this.bindStatusChart();
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.partsAudits.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }

  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    if (this.serverMode) {
      this.pageSize = event.pageSize;
      this.getPartsAuidt(true);
      return;
    }
    this.pageSize = event.pageSize;
    this.loadPageData();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  changeStatus(audit: any) {
    const obj = {
      partAuditId: audit.partAuditId,
      statusId: audit.statusId
    };

    this.partAuditService.updatePartAuditStatus(obj).subscribe((res: any) => {
      if (res.success) {
        this.alertService.createAlert(res.message, 1);
        this.getPartsAuidt();
      } else {
        this.alertService.createAlert(res.message, 0);
      }
    });
  }

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.partAuditService.DeletePartAudit(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsAuidt();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  changeArchiveStatus(item: any) {
    const dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      data: {
        component: null,
        title: 'Archive Confirmation',
        content: `Are you sure you want to ${item.archive ? 'Unarchive' : 'Archive'} this record?`,
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const payload = {
          ...item,
          archive: !item.archive
        };

        this.partAuditService.archiveStatusChange(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.getPartsAuidt();
              this.alertService.createAlert(res.message, 1);
              item.archive = !item.archive;
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          },
          error: () => {
            this.alertService.createAlert('Something went wrong.', 0);
          }
        });
      }
    });
  }

  bindCommodityChart() {
    const counts: any = {};
    this.partsAudits.forEach((x: any) => {
      const key = x.commodityName || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
    const topFive = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((sum: number, item: any) => sum + item[1], 0);

    const chartData: any[] = topFive.map((x: any) => ({
      name: x[0],
      y: x[1]
    }));

    if (othersCount > 0) {
      chartData.push({
        name: 'Others',
        y: othersCount
      });
    }

    this.commodityChartOptions = {
      ...this.getBaseChartOptions('Commodity Distribution', this.commodityColors),
      series: [{
        type: 'pie',
        name: 'Commodity',
        data: chartData
      }]
    };
  }

  bindAuditorChart() {
    const counts: any = {};
    this.partsAudits.forEach((x: any) => {
      const key = x.auditorName || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
    const topFive = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((sum: number, item: any) => sum + item[1], 0);

    const chartData: any[] = topFive.map((x: any) => ({
      name: x[0],
      y: x[1]
    }));

    if (othersCount > 0) {
      chartData.push({
        name: 'Others',
        y: othersCount
      });
    }

    this.auditorChartOptions = {
      ...this.getBaseChartOptions('Auditor Distribution', this.auditorColors),
      series: [{
        type: 'pie',
        name: 'Auditor',
        data: chartData
      }]
    };
  }

  bindStatusChart() {
    const counts: any = {};
    this.partsAudits.forEach((x: any) => {
      const key = x.statusName || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    const chartData = Object.entries(counts).map((x: any) => ({
      name: x[0],
      y: x[1]
    }));

    this.statusChartOptions = {
      ...this.getBaseChartOptions('Audits Status', this.statusColors),
      series: [{
        type: 'pie',
        name: 'Status',
        data: chartData
      }]
    };
  }

  changeDoneStatus(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      data: {
        component: null,
        title: 'Change Status Confirmation',
        content: `Are you sure you want to mark this record as ${item.done ? 'Not Done' : 'Done'}?`,
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const payload = { ...item, done: !item.done };
        this.partAuditService.updatePartAuditDoneStatus(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.getPartsAuidt();
              this.alertService.createAlert(res.message, 1);
              item.done = !item.done;
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  scrollGrid(side: 'left' | 'right') {
    const ele = document.getElementById('table-responsive');
    const scrollAmount = 300;

    if (ele) {
      if (side === 'right') {
        ele.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        ele.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }

  scrollRight() {
    this.scrollGrid('right');
  }

  scrollLeft() {
    this.scrollGrid('left');
  }

  private commodityColors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  private auditorColors = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#ec4899', '#14b8a6'];
  private statusColors = ['#6366f1', '#f97316', '#22c55e', '#06b6d4', '#e11d48', '#8b5cf6'];

  private getBaseChartOptions(title: string, colors: string[]): Highcharts.Options {
    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit'
        }
      },
      title: {
        text: title,
        align: 'center',
        style: {
          fontSize: '14px',
          fontWeight: '700',
          color: '#1e293b'
        }
      },
      colors: colors,
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderRadius: 8,
        shadow: true,
        style: {
          color: '#1e293b',
          fontSize: '12px'
        },
        pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)'
      },
      plotOptions: {
        pie: {
          innerSize: '50%',
          size: '75%',
          center: ['50%', '50%'],
          borderWidth: 2,
          borderColor: '#ffffff',
          shadow: {
            color: 'rgba(0,0,0,0.06)',
            offsetX: 0,
            offsetY: 2,
            width: 4
          } as any,
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>',
            style: {
              fontSize: '10px',
              fontWeight: '600',
              color: '#475569',
              textOutline: 'none',
              textOverflow: 'ellipsis',
              width: 80
            },
            crop: false,
            overflow: 'allow' as any,
            distance: 18,
            connectorColor: '#94a3b8',
            connectorWidth: 1
          },
          states: {
            hover: {
              halo: { size: 8, attributes: { fill: 'rgba(99,102,241,0.15)' } },
              brightness: 0.08
            }
          },
          allowPointSelect: true,
          cursor: 'pointer',
          slicedOffset: 12
        }
      }
    };
  }

  commodityChartOptions: Highcharts.Options = {
    ...this.getBaseChartOptions('Commodity Distribution', this.commodityColors),
    series: [
      {
        type: "pie",
        name: "Commodity",
        data: [
          { name: "Casting", y: 25 },
          { name: "Forging", y: 15 },
          { name: "Machining", y: 20 },
          { name: "Fasteners", y: 15 },
          { name: "Non-Metallic", y: 15 },
          { name: "Sheet Metal", y: 10 }
        ]
      }
    ]
  };

  auditorChartOptions: Highcharts.Options = {
    ...this.getBaseChartOptions('Auditor Distribution', this.auditorColors),
    series: [
      {
        type: "pie",
        name: "Auditor",
        data: [
          { name: "Ramesh Kumar", y: 25 },
          { name: "Suresh Singh", y: 25 },
          { name: "Sagar Kumar", y: 25 },
          { name: "Mahesh Kumar", y: 25 }
        ]
      }
    ]
  };

  statusChartOptions: Highcharts.Options = {
    ...this.getBaseChartOptions('Audits Status', this.statusColors),
    series: [
      {
        type: "pie",
        name: "Status",
        data: [
          { name: "Hold", y: 25 },
          { name: "WIP", y: 25 },
          { name: "Completed", y: 25 },
          { name: "Pending", y: 25 }
        ]
      }
    ]
  };

  openGridView(data: any) {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault();
    const dialogRef = this.dialog.open(AuditDonePopupComponent, {
      width: '480px',
      data: { audit }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        audit.done = !audit.done;
      }
    });
  }

  openaudit(data?: any) {
    const dialogRef = this.dialog.open(NewAuditComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getPartsAuidt();
      }
    });
  }

  defaultColumns: string[] = [
    'Audit Reference',
    'Commodity',
    'Part Family',
    'Part',
    'Supplier',
    'Auditor',
    'State',
    'City',
    'Audit Date',
    'CAPA',
    'Report',
    'Status',
    'Done',
    'Actions'
  ];

  activeColumns: string[] = [];
  frozenCount = 0;

  getColumnWidth(column: string): number {
    const widths: { [key: string]: number } = {
      'Audit Reference': 180,
      'Commodity': 180,
      'Part Family': 180,
      'Part': 180,
      'Supplier': 180,
      'Auditor': 180,
      'State': 150,
      'City': 150,
      'Audit Date': 150,
      'CAPA': 120,
      'Report': 120,
      'Status': 150,
      'Done': 100,
      'Actions': 80
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
    this.loadGridColumns();

    const dialogRef = this.dialog.open(ColumnSelectorComponent, {
      width: '950px',
      height: 'auto',
      disableClose: true,
      data: {
        userId: 1,
        gridType: 'PartsAuditTable',
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
      userId: 1,
      gridType: 'PartsAuditTable'
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

    setTimeout(() => this.updateStickyHeader(), 50);
  }

  padId(id: number): string {
    return String(id).padStart(6, '0');
  }
}
