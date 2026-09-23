import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActiveGridDialogComponent } from '../paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { ProcessAuditService } from '../process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import * as Highcharts from 'highcharts';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { PartAuditService } from '../../parts-audits/part-audit.service';

@Component({
  standalone: false,
  selector: 'app-paudits-completed-audits',
  templateUrl: './paudits-completed-audits.component.html',
  styleUrls: ['./paudits-completed-audits.component.scss']
})
export class PauditsCompletedAuditsComponent implements OnInit {

  //Screen Permissions
  canRead: boolean = false;
  canUpdate: boolean = false;
  readonly SCREEN_ID: number = 14;

  Highcharts: typeof Highcharts = Highcharts;

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
        pointFormat: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)'
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

  commodityChartOptions: Highcharts.Options = { ...this.getBaseChartOptions('Commodity Distribution', this.commodityColors), series: [{ type: 'pie', name: 'Commodity', data: [] }] } as any;
  auditorChartOptions: Highcharts.Options = { ...this.getBaseChartOptions('Auditor Distribution', this.auditorColors), series: [{ type: 'pie', name: 'Auditor', data: [] }] } as any;
  statusChartOptions: Highcharts.Options = { ...this.getBaseChartOptions('Audits Status', this.statusColors), series: [{ type: 'pie', name: 'Status', data: [] }] } as any;

  commodityChartRef: Highcharts.Chart | null = null;
  auditorChartRef: Highcharts.Chart | null = null;
  statusChartRef: Highcharts.Chart | null = null;

  commodityCallback: Highcharts.ChartCallbackFunction = (chart) => { this.commodityChartRef = chart; };
  auditorCallback: Highcharts.ChartCallbackFunction = (chart) => { this.auditorChartRef = chart; };
  statusCallback: Highcharts.ChartCallbackFunction = (chart) => { this.statusChartRef = chart; };

  // API Data
  completedAuditData: any[] = [];
  statusLookups: any[] = [];

  // Pagination
  pageSize = 20;
  pageIndex = 0;
  isLoading = true;

  // Filter variables
  originalAuditData: any[] = [];
  filteredAuditData: any[] = [];
  filterToggle = false;
  filterForm!: FormGroup;

  get uniqueCommodities() { return [...new Set(this.originalAuditData.map(a => a.commodityName).filter(Boolean))].sort(); }
  get uniqueStates() { return [...new Set(this.originalAuditData.map(a => a.stateName).filter(Boolean))].sort(); }
  get uniqueCities() {
    const selectedState = this.filterForm?.value?.State;
    let data = this.originalAuditData;
    if (selectedState) {
      data = data.filter(a => a.stateName === selectedState);
    }
    return [...new Set(data.map(a => a.cityName).filter(Boolean))].sort();
  }
  get uniqueSuppliers() { return [...new Set(this.originalAuditData.map(a => a.supplierName).filter(Boolean))].sort(); }
  get uniqueStages() { return [...new Set(this.originalAuditData.map(a => a.stageName).filter(Boolean))].sort(); }
  get uniqueAuditors() { return [...new Set(this.originalAuditData.map(a => a.auditorName).filter(Boolean))].sort(); }

  get pagedAuditData() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredAuditData.slice(start, start + this.pageSize);
  }

  constructor(
    private dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private partAuditService: PartAuditService
  ) {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: [null],
      Stage: [null],
      Auditor: [null],
      FromDate: [null],
      ToDate: [null],
      Commodity: [null],
      State: [null],
      City: [null],
      Supplier: [null]
    });
  }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);

    if (!this.canRead) return;

    this.loadLookups();
    this.loadGridColumns();
  }

  loadLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.statusLookups = res.data.filter((l: any) => l.codeMasterName === 'Audit-Status');
      }
      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;
    this.api.getAllAudits().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.completedAuditData = res.data.filter((a: any) => a.isDone === true);
          this.originalAuditData = [...this.completedAuditData];
          this.filteredAuditData = [...this.completedAuditData];

          const maxPage = Math.ceil(this.filteredAuditData.length / this.pageSize) - 1;
          if (this.pageIndex > maxPage && this.pageIndex > 0) {
            this.pageIndex = maxPage;
          }

          this.updateCharts();
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatusName(statusId: number): string {
    const status = this.statusLookups.find(s => s.lookupId === statusId);
    return status ? status.lookupName : 'N/A';
  }

  updateCharts() {
    const chartData = this.filteredAuditData;

    const getCounts = (key: string) => {
      return chartData.reduce((acc: any, curr: any) => {
        const name = curr[key] || 'Unassigned';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});
    };

    const commodityCounts = getCounts('commodityName');
    const auditorCounts = getCounts('auditorName');

    const statusCounts = chartData.reduce((acc: any, curr: any) => {
      const name = this.getStatusName(curr.statusId);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const formatData = (counts: any) => Object.keys(counts).map(k => ({ name: k, y: counts[k] }));

    if (this.commodityChartRef && this.commodityChartRef.series.length > 0) {
      this.commodityChartRef.series[0].setData(formatData(commodityCounts), true, false, false);
    }
    if (this.auditorChartRef && this.auditorChartRef.series.length > 0) {
      this.auditorChartRef.series[0].setData(formatData(auditorCounts), true, false, false);
    }
    if (this.statusChartRef && this.statusChartRef.series.length > 0) {
      this.statusChartRef.series[0].setData(formatData(statusCounts), true, false, false);
    }
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  openGridView() {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  onStateChange() {
    this.filterForm.get('City')?.setValue(null);
  }

  filter() {
    const keyword = this.filterForm.value.Keyword?.toLowerCase() || '';
    const commodity = this.filterForm.value.Commodity;
    const state = this.filterForm.value.State;
    const city = this.filterForm.value.City;
    const supplier = this.filterForm.value.Supplier;
    const stage = this.filterForm.value.Stage;
    const auditor = this.filterForm.value.Auditor;
    const fromDate = this.filterForm.value.FromDate;
    const toDate = this.filterForm.value.ToDate;

    this.filteredAuditData = this.originalAuditData.filter((item: any) => {
      let matchesKeyword = true;
      let matchesCommodity = true;
      let matchesState = true;
      let matchesCity = true;
      let matchesSupplier = true;
      let matchesStage = true;
      let matchesAuditor = true;
      let matchesDate = true;

      if (keyword) {
        matchesKeyword =
          (item.auditReference && item.auditReference.toLowerCase().includes(keyword)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(keyword)) ||
          (item.auditorName && item.auditorName.toLowerCase().includes(keyword)) ||
          (item.commodityName && item.commodityName.toLowerCase().includes(keyword)) ||
          (item.stateName && item.stateName.toLowerCase().includes(keyword)) ||
          (item.cityName && item.cityName.toLowerCase().includes(keyword));
      }

      if (commodity) { matchesCommodity = item.commodityName === commodity; }
      if (state) { matchesState = item.stateName === state; }
      if (city) { matchesCity = item.cityName === city; }
      if (supplier) { matchesSupplier = item.supplierName === supplier; }
      if (stage) { matchesStage = item.stageName === stage; }
      if (auditor) { matchesAuditor = item.auditorName === auditor; }

      if (fromDate || toDate) {
        const auditDate = new Date(item.auditDate);
        auditDate.setHours(0, 0, 0, 0);

        if (fromDate) {
          const start = new Date(fromDate);
          start.setHours(0, 0, 0, 0);
          if (auditDate < start) matchesDate = false;
        }
        if (toDate) {
          const end = new Date(toDate);
          end.setHours(0, 0, 0, 0);
          if (auditDate > end) matchesDate = false;
        }
      }

      return matchesKeyword && matchesCommodity && matchesState && matchesCity && matchesSupplier && matchesStage && matchesAuditor && matchesDate;
    });
    this.pageIndex = 0;
  }

  clearFilter() {
    this.filterForm.reset();
    this.filteredAuditData = [...this.originalAuditData];
    const maxPage = Math.max(0, Math.ceil(this.filteredAuditData.length / this.pageSize) - 1);
    if (this.pageIndex > maxPage) {
      this.pageIndex = maxPage;
    }
  }

  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault();
    if (!this.canUpdate) {
      this.alertService.createAlert('Access Denied: You do not have permission to change the Audit status.', 0);
      return;
    }

    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true,
      data: {
        title: 'Confirm Action',
        content: audit.isDone
          ? 'Are you sure you want to mark this audit as Not Done? It will be moved back to Active Audits.'
          : 'Are you sure you want to mark this audit as Done?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        audit.isDone = !audit.isDone;
        this.api.upsertAudit(audit).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(
                audit.isDone ? 'Audit marked as Done' : 'Audit moved back to Active Audits', 1
              );
              this.loadData();
            } else {
              audit.isDone = !audit.isDone;
              this.alertService.createAlert(res.message || 'Failed to update', 0);
            }
          },
          error: () => {
            audit.isDone = !audit.isDone;
            this.alertService.createAlert('Error updating audit', 0);
          }
        });
      }
    });
  }

  scrollRight() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollLeft() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
  }

  defaultColumns: string[] = [
    'Audit Reference',
    'Commodity',
    'State',
    'City',
    'Supplier',
    'Auditor',
    'Audit Date',
    'CAPA',
    'Report',
    'Status',
    'Done'
  ];

  activeColumns: string[] = [];
  frozenCount = 0;

  getColumnWidth(column: string): number {
    const widths: { [key: string]: number } = {
      'Audit Reference': 180,
      'Commodity': 180,
      'State': 150,
      'City': 150,
      'Supplier': 180,
      'Auditor': 180,
      'Audit Date': 150,
      'CAPA': 120,
      'Report': 120,
      'Status': 150,
      'Done': 100
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
        userId: 1,
        gridType: 'ProcessAuditCompleteTable',
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
      gridType: 'ProcessAuditCompleteTable'
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