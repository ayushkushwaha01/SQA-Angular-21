import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import * as Highcharts from 'highcharts';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { ActiveGridDialogComponent } from 'src/app/pages/internal-portal/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { ProcessAuditService } from 'src/app/pages/internal-portal/process-audits/process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: false,
  selector: 'app-sup-proactivegrid',
  templateUrl: './sup-proactivegrid.component.html',
  styleUrls: ['./sup-proactivegrid.component.scss']
})
export class SupProactivegridComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

    updateFlag: boolean = false;

  // Chart Configuration
  auditScoreChartOptions: Highcharts.Options = {
    chart: { type: 'column', height: 350, backgroundColor: '#ffffff', animation: false },
    title: { text: 'Latest 10 Process Audit Scores', style: { color: '#333333', fontSize: '18px', fontWeight: 'bold' } },
    colors: ['#2b6ca3'],
    credits: { enabled: false },
    xAxis: { categories: [], title: { text: 'Audit Reference', style: { color: '#666666' } }, labels: { style: { color: '#333333' } }, crosshair: true },
    yAxis: { min: 0, max: 100, title: { text: 'Score (%)', style: { color: '#666666' } }, labels: { style: { color: '#333333' } }, gridLineColor: '#e6e6e6' },
    tooltip: { shared: true, useHTML: true },
    plotOptions: {
      series: { animation: false },
      column: { animation: false, color: '#2b6ca3', pointPadding: 0.2, borderWidth: 0, borderColor: 'transparent', dataLabels: { enabled: true, format: '{point.y}%', style: { color: '#333333', fontWeight: 'bold' } } }
    },
    series: [{ type: 'column', name: 'Audit Score', data: [], color: '#2b6ca3', animation: false }]
  };

  auditData: any[] = [];
  statusLookups: any[] = [];

  // Filter properties
  filterToggle: boolean = false;
  originalAuditData: any[] = [];
  filterForm!: FormGroup;

  // Filter Dropdown options
  uniqueCommodities: string[] = [];
  uniqueSuppliers: string[] = [];
  uniqueAuditors: string[] = [];
  uniqueCities: string[] = [];
  uniqueStates: string[] = [];
  uniqueStages: string[] = [];

  constructor(
    private dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService,
    private fb: FormBuilder, private partAuditService: PartAuditService
  ) {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Commodity: [''],
      Supplier: [''],
      Stage: [''],
      Auditor: [''],
      State: [''],
      City: [''],
      FromDate: [''],
      ToDate: ['']
    });
  }
  pageSize: number = 20;

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.loadLookups();
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

  loadLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.statusLookups = res.data.filter((l: any) => l.codeMasterName === 'Audit-Status');
      }
      this.loadData();
    });
  }

  loadData() {
    // const supplierId = Number(localStorage.getItem('SupplierId')) || Number(localStorage.getItem('UserId')) || 0;

    const supplierId = this.getSupplierId();

    this.api.getAllAuditsSupplier(supplierId).subscribe((res: any) => {
      if (res.success) {
        this.originalAuditData = res.data.map((item: any) => {
          const statusObj = this.statusLookups.find((l: any) => l.lookupId === item.statusId);
          const cleanReport = item.report != null ? item.report.toString().replace(/%/g, '').trim() : '0';
          return {
            processAuditId: item.processAuditId,
            auditReference: item.auditReference,
            ref: item.auditReference,
            commodity: item.commodityName,
            location: item.cityName,
            supplier: item.supplierName,
            auditor: item.auditorName,
            date: new Date(item.auditDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
            action: item.capaSummary,
            score: cleanReport + ' %',
            status: statusObj ? statusObj.lookupName : 'Open',
            done: item.isDone,
            rawScore: parseInt(cleanReport || '0', 10),
            state: item.stateName,
            stage: item.stageName,
            auditDateObj: new Date(item.auditDate)
          };
        });

        // Extract unique values for filters
        this.uniqueCommodities = [...new Set(this.originalAuditData.map(a => a.commodity).filter(Boolean))];
        this.uniqueSuppliers = [...new Set(this.originalAuditData.map(a => a.supplier).filter(Boolean))];
        this.uniqueAuditors = [...new Set(this.originalAuditData.map(a => a.auditor).filter(Boolean))];
        this.uniqueCities = [...new Set(this.originalAuditData.map(a => a.location).filter(Boolean))];
        this.uniqueStates = [...new Set(this.originalAuditData.map(a => a.state).filter(Boolean))];
        this.uniqueStages = [...new Set(this.originalAuditData.map(a => a.stage).filter(Boolean))];

        this.auditData = [...this.originalAuditData];
        this.updatePagination();
        this.updateChart();
      }
    });
  }

  updateChart() {
    const latest10 = (this.auditData || []).slice(0, 10);
    const categories = latest10.map(a => (a.ref || '').split('/').pop() || '');
    const scores = latest10.map(a => Number(a.rawScore ?? a.score ?? 0));

    this.auditScoreChartOptions = {
      ...this.auditScoreChartOptions,
      chart: { type: 'column', height: 350, backgroundColor: '#ffffff', animation: false },
      title: { text: 'Latest 10 Process Audit Scores', style: { color: '#333333', fontSize: '18px', fontWeight: 'bold' } },
      colors: ['#2b6ca3'],
      xAxis: { categories: categories, title: { text: 'Audit Reference', style: { color: '#666666' } }, labels: { style: { color: '#333333' } }, crosshair: true },
      yAxis: { min: 0, max: 100, title: { text: 'Score (%)', style: { color: '#666666' } }, labels: { style: { color: '#333333' } }, gridLineColor: '#e6e6e6' },
      plotOptions: {
        column: {
          color: '#2b6ca3',
          pointPadding: 0.2,
          borderWidth: 0,
          borderColor: 'transparent',
          dataLabels: { enabled: true, format: '{point.y}%', style: { color: '#333333', fontWeight: 'bold' } }
        }
      },
      series: [{ type: 'column', name: 'Audit Score', data: scores, color: '#2b6ca3', animation: false }]
    };
    this.updateFlag = true;
  }

  filterData() {
    const filters = this.filterForm.value;
    const kw = (filters.Keyword || '').toLowerCase();

    this.auditData = this.originalAuditData.filter(item => {
      let isMatch = true;

      // Keyword match
      if (kw) {
        const searchStr = `${item.ref} ${item.commodity} ${item.location} ${item.supplier} ${item.auditor} ${item.status}`.toLowerCase();
        if (!searchStr.includes(kw)) isMatch = false;
      }

      // Dropdown matches
      if (filters.Commodity && item.commodity !== filters.Commodity) isMatch = false;
      if (filters.Supplier && item.supplier !== filters.Supplier) isMatch = false;
      if (filters.Stage && item.stage !== filters.Stage) isMatch = false;
      if (filters.Auditor && item.auditor !== filters.Auditor) isMatch = false;
      if (filters.State && item.state !== filters.State) isMatch = false;
      if (filters.City && item.location !== filters.City) isMatch = false;

      // Date matches
      if (filters.FromDate && item.auditDateObj) {
        if (item.auditDateObj < filters.FromDate) isMatch = false;
      }
      if (filters.ToDate && item.auditDateObj) {
        if (item.auditDateObj > filters.ToDate) isMatch = false;
      }

      return isMatch;
    });

    // Reset pagination to first page on filter
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagination();
    this.updateChart();
  }

  clearFilter() {
    this.filterForm.reset();
    this.auditData = [...this.originalAuditData];

    // Reset pagination to first page on clear
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagination();
    this.updateChart();
  }

  pagedAuditData: any[] = [];

  updatePagination() {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.pagedAuditData = this.auditData.slice(startIndex, startIndex + this.paginator.pageSize);
    } else {
      this.pagedAuditData = this.auditData.slice(0, 5); // Default page size is 5
    }
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.updatePagination();
    });
    // Ensure initial pagination is set after view inits if data loaded early
    this.updatePagination();
  }

  openGridView() {
    this.dialog.open(ActiveGridDialogComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  openscorepdf(fileName: string): void { window.open(`assets/${fileName}`, '_blank'); }

  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault();
    this.alertService.createAlert('Suppliers cannot modify the Done status.', 0);
  }


  defaultColumns: string[] = [
    'Audit Reference',
    'Commodity',
    'Location',
    'Supplier',
    'Auditor',
    'Audit Date',
    'CAPA',
    'Report',
    'Status',
    'Done',
    'Manage'
  ];

  activeColumns: string[] = [];

  frozenCount: number = 0;


  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Audit Reference': 180,
      'Commodity': 180,
      'Location': 180,
      'Supplier': 180,
      'Auditor': 180,
      'Audit Date': 150,
      'CAPA': 120,
      'Report': 120,
      'Status': 150,
      'Done': 100,
      'Manage': 120

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
        gridType: 'SupplierProcessAuditTable',
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
      gridType: 'SupplierProcessAuditTable'
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