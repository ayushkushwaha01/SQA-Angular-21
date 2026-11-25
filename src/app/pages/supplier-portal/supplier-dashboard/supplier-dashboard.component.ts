// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import * as Highcharts from 'highcharts';
// import { HighchartsChartModule } from 'highcharts-angular';
// import { SupplierDashboardService } from './supplier-dashboard.service';
// import { jwtDecode } from 'jwt-decode';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatOptionModule } from '@angular/material/core';

// @Component({
//   selector: 'app-supplier-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     HighchartsChartModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     MatOptionModule
//   ],
//   templateUrl: './supplier-dashboard.component.html',
//   styleUrls: ['./supplier-dashboard.component.scss']
// })
// export class SupplierDashboardComponent implements OnInit {

//   Highcharts: typeof Highcharts = Highcharts;
//   filterForm!: FormGroup;

//   dashboardData: any = null;
//   commodities: any[] = [];
//   severities: any[] = [];
//   years = ['2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];

//   supplierId: number = 0;
//   localProcessCommodityId: number | null = null;
//   localPartsCommodityId: number | null = null;

//   processChartRef: Highcharts.Chart | null = null;
//   partsChartRef: Highcharts.Chart | null = null;
//   trendChartRef: Highcharts.Chart | null = null;

//   processCallback: Highcharts.ChartCallbackFunction = (chart) => { this.processChartRef = chart; };
//   partsCallback: Highcharts.ChartCallbackFunction = (chart) => { this.partsChartRef = chart; };
//   trendCallback: Highcharts.ChartCallbackFunction = (chart) => { this.trendChartRef = chart; };

//   getBaseOptions(isTrend: boolean = false, color: string = '#6b69a6'): Highcharts.Options {
//     return {
//       chart: { type: 'column', backgroundColor: 'transparent' },
//       title: { text: undefined }, 
//       colors: isTrend ? ['#6b69a6', '#55c898'] : [color], 
//       xAxis: { categories: [], lineColor: '#ccc', tickColor: 'transparent' },
//       yAxis: { min: 0, max: 100, title: { text: undefined }, gridLineColor: '#f0f0f0' },
//       legend: { 
//         layout: 'horizontal', align: 'center', verticalAlign: 'bottom',
//         itemStyle: { fontSize: '11px', color: '#555', fontWeight: 'bold' },
//         symbolRadius: 0 
//       },
//       exporting: { enabled: false },
//       credits: { enabled: false },
//       plotOptions: { column: { pointPadding: 0.1, borderWidth: 0, groupPadding: 0.2 } },
//       series: isTrend ? [{ type: 'column', name: 'Process Audits', data: [] }, { type: 'column', name: 'Parts Audit', data: [] }] : [{ type: 'column', name: 'Score', data: [] }]
//     };
//   }

//   partsAuditOptions: Highcharts.Options = this.getBaseOptions(false, '#6b69a6');
//   processAuditOptions: Highcharts.Options = this.getBaseOptions(false, '#55c898');
//   monthlyTrendOptions: Highcharts.Options = this.getBaseOptions(true);

//   constructor(private fb: FormBuilder, private api: SupplierDashboardService) {
//     this.filterForm = this.fb.group({
//       commodityId: [null],
//       severityId: [null],
//       finYear: ['2026-2027']
//     });
//   }

//   ngOnInit(): void {
//     // this.supplierId = Number(localStorage.getItem('SupplierId')) || Number(localStorage.getItem('UserId')) || 0;
//     const supplierId = this.getSupplierId();
//     this.loadDropdowns();
//     this.loadDashboard();
//   }

//   onTableWheel(event: WheelEvent): void {
//     const target = event.currentTarget as HTMLElement;
//     if (!target) return;
//     event.preventDefault();
//     event.stopPropagation();
//     target.scrollTop += event.deltaY;
//   }

//   private getSupplierId(): number {
//     const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
//     if (token) {
//       try {
//         const decoded: any = jwtDecode(token);
//         const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
//           || decoded.nameid
//           || decoded.SupplierId
//           || decoded.supplierId
//           || decoded.UserId
//           || decoded.userId
//           || decoded.sub;
//         if (id && Number(id) > 0) {
//           return Number(id);
//         }
//       } catch (err) {
//         console.error('Error decoding token for supplierId:', err);
//       }
//     }
//     const localSuppId = localStorage.getItem('SupplierId') || localStorage.getItem('UserId') || sessionStorage.getItem('SupplierId') || sessionStorage.getItem('UserId');
//     return Number(localSuppId) || 0;
//   }


//   loadDropdowns() {
//     this.api.getCommodities().subscribe((res: any) => { if (res.success) this.commodities = res.data; });
//     this.api.getSeverities().subscribe((res: any) => { if (res.success) this.severities = res.data; });
//   }

//   loadDashboard() {
//     const filters = this.filterForm.value;
//     this.localProcessCommodityId = filters.commodityId;
//     this.localPartsCommodityId = filters.commodityId;
    
//     // this.api.getDashboardData(this.supplierId, filters.finYear, filters.commodityId, filters.severityId)
//     this.api.getDashboardData(filters.finYear, filters.commodityId, filters.severityId)
//       .subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             this.dashboardData = res.data;
//             this.updateCharts(res.data.charts);
//           }
//         }
//       });
//   }

//   updateCharts(charts: any) {
//     if (this.processChartRef && this.processChartRef.series.length > 0) {
//       this.processChartRef.xAxis[0].setCategories(charts.processRefs, false);
//       this.processChartRef.series[0].setData(charts.processScores, true, false, false);
//     }
//     if (this.partsChartRef && this.partsChartRef.series.length > 0) {
//       this.partsChartRef.xAxis[0].setCategories(charts.partsRefs, false);
//       this.partsChartRef.series[0].setData(charts.partsScores, true, false, false);
//     }
//     if (this.trendChartRef && this.trendChartRef.series.length > 1) {
//       this.trendChartRef.xAxis[0].setCategories(charts.trendCategories, false);
//       this.trendChartRef.series[0].setData(charts.processMonthly, false, false, false);
//       this.trendChartRef.series[1].setData(charts.partsMonthly, true, false, false);
//     }
//   }

//   onFilterSubmit() { this.loadDashboard(); }

//   onClearFilter() {
//     this.filterForm.patchValue({
//       commodityId: null,
//       severityId: null,
//       finYear: '2026-2027'
//     });
//     this.loadDashboard();
//   }

//   onProcessCommodityChange(commodityId: number | null) {
//     this.localProcessCommodityId = commodityId;
//     // this.api.getProcessChartData(this.supplierId, this.filterForm.value.finYear, commodityId ? commodityId : undefined).subscribe({
//     this.api.getProcessChartData(this.filterForm.value.finYear, commodityId ? commodityId : undefined).subscribe({
//       next: (res: any) => {
//         if (res.success && this.processChartRef && this.processChartRef.series.length > 0) {
//           const chartData = res.data;
//           const refs = chartData.refs || chartData.Refs || [];
//           const scores = chartData.scores || chartData.Scores || [];
//           this.processChartRef.xAxis[0].setCategories(refs, false);
//           this.processChartRef.series[0].setData(scores, true, false, false);
//         }
//       }
//     });
//   }

//   onPartsCommodityChange(commodityId: number | null) {
//     this.localPartsCommodityId = commodityId;
//     this.api.getPartsChartData(this.filterForm.value.finYear, commodityId ? commodityId : undefined).subscribe({ 
//       next: (res: any) => {
//         if (res.success && this.partsChartRef && this.partsChartRef.series.length > 0) {
//           const chartData = res.data;
//           const refs = chartData.refs || chartData.Refs || [];
//           const scores = chartData.scores || chartData.Scores || [];
//           this.partsChartRef.xAxis[0].setCategories(refs, false);
//           this.partsChartRef.series[0].setData(scores, true, false, false);
//         }
//       }
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { SupplierDashboardService } from './supplier-dashboard.service';
import { jwtDecode } from 'jwt-decode';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './supplier-dashboard.component.html',
  styleUrls: ['./supplier-dashboard.component.scss']
})
export class SupplierDashboardComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  // 1. UNIQUE SCREEN NAME FOR THE DATABASE
  private readonly SCREEN_NAME = 'SupplierDashboard';

  // 2. GET CURRENT USER ID (Grabs from localStorage or defaults to 0)
  private get currentUserId(): number {
    const userId = localStorage.getItem('UserId') || sessionStorage.getItem('UserId');
    return userId ? parseInt(userId, 10) : 0; 
  }

  dashboardData: any = null;
  commodities: any[] = [];
  severities: any[] = [];
  years = ['2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  supplierId: number = 0;
  localProcessCommodityId: number | null = null;
  localPartsCommodityId: number | null = null;

  processChartRef: Highcharts.Chart | null = null;
  partsChartRef: Highcharts.Chart | null = null;
  trendChartRef: Highcharts.Chart | null = null;

  processCallback: Highcharts.ChartCallbackFunction = (chart) => { this.processChartRef = chart; };
  partsCallback: Highcharts.ChartCallbackFunction = (chart) => { this.partsChartRef = chart; };
  trendCallback: Highcharts.ChartCallbackFunction = (chart) => { this.trendChartRef = chart; };

  getBaseOptions(isTrend: boolean = false, color: string = '#6b69a6'): Highcharts.Options {
    return {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: undefined }, 
      colors: isTrend ? ['#6b69a6', '#55c898'] : [color], 
      xAxis: { categories: [], lineColor: '#ccc', tickColor: 'transparent' },
      yAxis: { min: 0, max: 100, title: { text: undefined }, gridLineColor: '#f0f0f0' },
      legend: { 
        layout: 'horizontal', align: 'center', verticalAlign: 'bottom',
        itemStyle: { fontSize: '11px', color: '#555', fontWeight: 'bold' },
        symbolRadius: 0 
      },
      exporting: { enabled: false },
      credits: { enabled: false },
      plotOptions: { column: { pointPadding: 0.1, borderWidth: 0, groupPadding: 0.2 } },
      series: isTrend ? [{ type: 'column', name: 'Process Audits', data: [] }, { type: 'column', name: 'Parts Audit', data: [] }] : [{ type: 'column', name: 'Score', data: [] }]
    };
  }

  partsAuditOptions: Highcharts.Options = this.getBaseOptions(false, '#6b69a6');
  processAuditOptions: Highcharts.Options = this.getBaseOptions(false, '#55c898');
  monthlyTrendOptions: Highcharts.Options = this.getBaseOptions(true);

  constructor(private fb: FormBuilder, private api: SupplierDashboardService) {
    this.filterForm = this.fb.group({
      commodityId: [null],
      severityId: [null],
      finYear: ['2026-2027']
    });
  }

  ngOnInit(): void {
    this.supplierId = this.getSupplierId();
    this.loadDropdowns();
    
    // 3. RESTORE DB FILTERS BEFORE LOADING DATA
    this.restoreDbFilters();
  }

  /**
   * Retrieves saved filter state from the DB and patches the reactive form.
   */
  private restoreDbFilters(): void {
    // Assuming SupplierDashboardService has getUserFilters & saveUserFilters mapped to the new controller
    this.api.getUserFilters(this.currentUserId, this.SCREEN_NAME).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          try {
            const parsed = JSON.parse(res.data);
            this.filterForm.patchValue({
              commodityId: parsed.commodityId !== undefined ? parsed.commodityId : null,
              severityId: parsed.severityId !== undefined ? parsed.severityId : null,
              finYear: parsed.finYear || '2026-2027'
            });
          } catch (e) {
            console.error('Failed to parse DB filters', e);
          }
        }
        // Load data AFTER filters are restored
        this.loadDashboard();
      },
      error: () => {
        // Fallback if API fails
        this.loadDashboard();
      }
    });
  }

  /**
   * Silently saves current form values to DB
   */
  private saveCurrentFiltersToDb(): void {
    const payload = {
      userId: this.currentUserId,
      screenName: this.SCREEN_NAME,
      filterJSON: JSON.stringify(this.filterForm.value)
    };
    this.api.saveUserFilters(payload).subscribe();
  }

  onTableWheel(event: WheelEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    target.scrollTop += event.deltaY;
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


  loadDropdowns() {
    this.api.getCommodities().subscribe((res: any) => { if (res.success) this.commodities = res.data; });
    this.api.getSeverities().subscribe((res: any) => { if (res.success) this.severities = res.data; });
  }

  loadDashboard() {
    // 4. SAVE FILTERS TO DB EVERY TIME DATA IS REQUESTED
    this.saveCurrentFiltersToDb();

    const filters = this.filterForm.value;
    this.localProcessCommodityId = filters.commodityId;
    this.localPartsCommodityId = filters.commodityId;
    
    this.api.getDashboardData(filters.finYear, filters.commodityId, filters.severityId)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.dashboardData = res.data;
            this.updateCharts(res.data.charts);
          }
        }
      });
  }

  updateCharts(charts: any) {
    if (this.processChartRef && this.processChartRef.series.length > 0) {
      this.processChartRef.xAxis[0].setCategories(charts.processRefs, false);
      this.processChartRef.series[0].setData(charts.processScores, true, false, false);
    }
    if (this.partsChartRef && this.partsChartRef.series.length > 0) {
      this.partsChartRef.xAxis[0].setCategories(charts.partsRefs, false);
      this.partsChartRef.series[0].setData(charts.partsScores, true, false, false);
    }
    if (this.trendChartRef && this.trendChartRef.series.length > 1) {
      this.trendChartRef.xAxis[0].setCategories(charts.trendCategories, false);
      this.trendChartRef.series[0].setData(charts.processMonthly, false, false, false);
      this.trendChartRef.series[1].setData(charts.partsMonthly, true, false, false);
    }
  }

  onFilterSubmit() { this.loadDashboard(); }

  onClearFilter() {
    this.filterForm.patchValue({
      commodityId: null,
      severityId: null,
      finYear: '2026-2027'
    });
    
    // Save empty state to DB
    this.saveCurrentFiltersToDb();
    
    this.loadDashboard();
  }

  onProcessCommodityChange(commodityId: number | null) {
    this.localProcessCommodityId = commodityId;
    this.api.getProcessChartData(this.filterForm.value.finYear, commodityId ? commodityId : undefined).subscribe({
      next: (res: any) => {
        if (res.success && this.processChartRef && this.processChartRef.series.length > 0) {
          const chartData = res.data;
          const refs = chartData.refs || chartData.Refs || [];
          const scores = chartData.scores || chartData.Scores || [];
          this.processChartRef.xAxis[0].setCategories(refs, false);
          this.processChartRef.series[0].setData(scores, true, false, false);
        }
      }
    });
  }

  onPartsCommodityChange(commodityId: number | null) {
    this.localPartsCommodityId = commodityId;
    this.api.getPartsChartData(this.filterForm.value.finYear, commodityId ? commodityId : undefined).subscribe({ 
      next: (res: any) => {
        if (res.success && this.partsChartRef && this.partsChartRef.series.length > 0) {
          const chartData = res.data;
          const refs = chartData.refs || chartData.Refs || [];
          const scores = chartData.scores || chartData.Scores || [];
          this.partsChartRef.xAxis[0].setCategories(refs, false);
          this.partsChartRef.series[0].setData(scores, true, false, false);
        }
      }
    });
  }
}