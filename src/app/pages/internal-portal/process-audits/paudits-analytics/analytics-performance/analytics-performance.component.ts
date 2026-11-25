// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import * as Highcharts from 'highcharts';
// import { ProcessAuditService } from '../../process-audit.service';
// import { PartAuditService } from '../../../parts-audits/part-audit.service';
// import { PartsAuditAnalayticsService } from '../parts-audit-analaytics.service';

// @Component({
//   standalone: false,
//   selector: 'app-analytics-performance',
//   templateUrl: './analytics-performance.component.html',
//   styleUrls: ['./analytics-performance.component.scss']
// })
// export class AnalyticsPerformanceComponent implements OnInit {
//   Highcharts: typeof Highcharts = Highcharts;
//   filterForm!: FormGroup;
//   originalTableData: any[] = [];

//   // Table Data Arrays
//   ratingList: any[] = [];
//   top10Year: any[] = [];
//   bottom10Year: any[] = [];
//   top10LastYears: any[] = [];
//   bottom10LastYears: any[] = [];

//   // Chart Options
//   performancePieOptions: Highcharts.Options = this.getInitialPieOptions();
//   top10YearOptions: Highcharts.Options = this.buildBarOptions([], []);
//   bottom10YearOptions: Highcharts.Options = this.buildBarOptions([], []);
//   top10LastYearsOptions: Highcharts.Options = this.buildBarOptions([], []);
//   bottom10LastYearsOptions: Highcharts.Options = this.buildBarOptions([], []);

//   constructor(
//     private fb: FormBuilder,
//     private auditService: ProcessAuditService,
//     private partAuditService: PartAuditService,
//     private analyticsService: PartsAuditAnalayticsService,
//   ) {
//     const currentYear = new Date().getFullYear().toString();
//     this.filterForm = this.fb.group({
//       commodityId: [null],
//       year: [currentYear]
//     });
//   }

//   ngOnInit(): void {
//     this.getCommodities();
//     this.getPerformance();
//   }

//   clearFilter(): void {
//     const currentYear = new Date().getFullYear().toString();
//     this.filterForm.reset({ year: currentYear });
//     this.getPerformance();
//   }

//   getCommodities() {
//     this.partAuditService.getCommodityDD().subscribe({
//       next: (res: any) => {
//         if (res.success) {
//           this.originalTableData = res.data;
//         }
//       },
//       error: (err: any) => {
//         console.error('Commodities API error:', err);
//       }
//     });
//   }

//   getPerformance() {
//     const filter = { ...this.filterForm.value };

//     // Clean up empty params
//     Object.keys(filter).forEach(key => {
//       if (filter[key] === null || filter[key] === undefined || filter[key] === '' || filter[key] === 'null') {
//         delete filter[key];
//       }
//     });

//     this.analyticsService.getperformance(filter).subscribe((res: any) => {
//       if (res.success) {
//         this.loadDistribution(res.data.distribution);
//         this.loadTopSuppliers(res.data.topSuppliers);
//         this.loadBottomSuppliers(res.data.bottomSuppliers);
//         this.loadTopSuppliersLast3Years(res.data.topSuppliersLast3Years);
//         this.loadBottomSuppliersLast3Years(res.data.bottomSuppliersLast3Years);
//       }
//     });
//   }

//   // ── Data Loaders & Chart Updaters ────────────────────────────────────────

//   private loadDistribution(data: any[]) {
//     this.ratingList = data;

//     // Map rating string to standard colors
//     const colorMap: { [key: string]: string } = {
//       'Excellent': '#e74c3c', // Red (as per original code)
//       'Good': '#27ae60',      // Green
//       'Average': '#f39c12',   // Orange/Yellow
//       'Poor': '#3498db'       // Blue
//     };

//     const pieData = data.map(item => ({
//       name: item.rating,
//       y: item.percentage,
//       color: colorMap[item.rating] || '#95a5a6'
//     }));

//     this.performancePieOptions = {
//       ...this.performancePieOptions,
//       series: [{
//         type: 'pie',
//         data: pieData
//       }]
//     };
//   }

//   private loadTopSuppliers(data: any[]) {
//     this.top10Year = data;
//     const categories = data.map(item => item.supplierName);
//     const seriesData = data.map(item => item.score);
//     this.top10YearOptions = this.buildBarOptions(categories, seriesData);
//   }

//   private loadBottomSuppliers(data: any[]) {
//     this.bottom10Year = data;
//     const categories = data.map(item => item.supplierName);
//     const seriesData = data.map(item => item.score);
//     this.bottom10YearOptions = this.buildBarOptions(categories, seriesData);
//   }

//   private loadTopSuppliersLast3Years(data: any[]) {
//     this.top10LastYears = data;
//     const categories = data.map(item => item.supplierName);
//     const seriesData = data.map(item => item.score);
//     this.top10LastYearsOptions = this.buildBarOptions(categories, seriesData);
//   }

//   private loadBottomSuppliersLast3Years(data: any[]) {
//     this.bottom10LastYears = data;
//     const categories = data.map(item => item.supplierName);
//     const seriesData = data.map(item => item.score);
//     this.bottom10LastYearsOptions = this.buildBarOptions(categories, seriesData);
//   }

//   // ── Helper Chart Configurations ──────────────────────────────────────────

//   private getInitialPieOptions(): Highcharts.Options {
//     return {
//       chart: {
//         type: 'pie',
//         backgroundColor: 'transparent',
//         height: 400
//       },
//       title: { text: '' },
//       credits: { enabled: false },
//       plotOptions: {
//         pie: {
//           dataLabels: {
//             enabled: true,
//             format: '<b>{point.name}</b>: {point.y:.1f}%'
//           },
//           showInLegend: false
//         }
//       },
//       series: [{ type: 'pie', data: [] }]
//     };
//   }

//   private buildBarOptions(categories: string[], data: number[]): Highcharts.Options {
//     return {
//       chart: {
//         type: 'column',
//         backgroundColor: 'transparent',
//         height: 400
//       },
//       title: { text: '' },
//       credits: { enabled: false },
//       exporting: { enabled: false },
//       xAxis: {
//         categories: categories,
//         labels: { rotation: -25, style: { fontSize: '11px' } }
//       },
//       yAxis: {
//         min: 0,
//         title: { text: '' },
//         gridLineColor: '#e0e0e0'
//       },
//       legend: { enabled: false }, // Hiding legend to save space since color changes per point
//       plotOptions: {
//         column: {
//           colorByPoint: true,
//           borderWidth: 0
//         }
//       },
//       series: [{
//         type: 'column',
//         name: 'Score',
//         data: data
//       }]
//     };
//   }

//   scrollToTop(): void {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { ProcessAuditService } from '../../process-audit.service';
import { PartAuditService } from '../../../parts-audits/part-audit.service';
import { PartsAuditAnalayticsService } from '../parts-audit-analaytics.service';

@Component({
  standalone: false,
  selector: 'app-analytics-performance',
  templateUrl: './analytics-performance.component.html',
  styleUrls: ['./analytics-performance.component.scss']
})
export class AnalyticsPerformanceComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;
  originalTableData: any[] = [];

  // 1. UNIQUE SCREEN NAME FOR THE DATABASE
  private readonly SCREEN_NAME = 'ProcessAnalyticsPerformance';

  // 2. GET CURRENT USER ID (Grabs from localStorage or defaults to 0)
  private get currentUserId(): number {
    const userId = localStorage.getItem('UserId') || sessionStorage.getItem('UserId');
    return userId ? parseInt(userId, 10) : 0; 
  }

  // Table Data Arrays
  ratingList: any[] = [];
  top10Year: any[] = [];
  bottom10Year: any[] = [];
  top10LastYears: any[] = [];
  bottom10LastYears: any[] = [];

  // Chart Options
  performancePieOptions: Highcharts.Options = this.getInitialPieOptions();
  top10YearOptions: Highcharts.Options = this.buildBarOptions([], []);
  bottom10YearOptions: Highcharts.Options = this.buildBarOptions([], []);
  top10LastYearsOptions: Highcharts.Options = this.buildBarOptions([], []);
  bottom10LastYearsOptions: Highcharts.Options = this.buildBarOptions([], []);

  constructor(
    private fb: FormBuilder,
    private auditService: ProcessAuditService,
    private partAuditService: PartAuditService,
    private analyticsService: PartsAuditAnalayticsService,
  ) {
    const currentYear = new Date().getFullYear().toString();
    this.filterForm = this.fb.group({
      commodityId: [null],
      year: [currentYear]
    });
  }

  ngOnInit(): void {
    this.getCommodities();
    
    // 3. RESTORE DB FILTERS BEFORE LOADING DATA
    this.restoreDbFilters();
  }

  /**
   * Retrieves saved filter state from the DB and patches the reactive form.
   */
  private restoreDbFilters(): void {
    this.analyticsService.getUserFilters(this.currentUserId, this.SCREEN_NAME).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          try {
            const parsed = JSON.parse(res.data);
            this.filterForm.patchValue({
              commodityId: parsed.commodityId !== undefined ? parsed.commodityId : null,
              year: parsed.year || new Date().getFullYear().toString()
            });
          } catch (e) {
            console.error('Failed to parse DB filters', e);
          }
        }
        // Load data AFTER filters are restored
        this.getPerformance();
      },
      error: () => {
        // Fallback if API fails
        this.getPerformance();
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
    this.analyticsService.saveUserFilters(payload).subscribe();
  }

  clearFilter(): void {
    const currentYear = new Date().getFullYear().toString();
    this.filterForm.reset({ year: currentYear });
    
    // Save empty state to DB
    this.saveCurrentFiltersToDb();
    
    this.getPerformance();
  }

  getCommodities() {
    this.partAuditService.getCommodityDD().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.originalTableData = res.data;
        }
      },
      error: (err: any) => {
        console.error('Commodities API error:', err);
      }
    });
  }

  getPerformance() {
    // 4. SAVE FILTERS TO DB ON GO CLICK
    this.saveCurrentFiltersToDb();

    const filter = { ...this.filterForm.value };

    // Clean up empty params
    Object.keys(filter).forEach(key => {
      if (filter[key] === null || filter[key] === undefined || filter[key] === '' || filter[key] === 'null') {
        delete filter[key];
      }
    });

    this.analyticsService.getperformance(filter).subscribe((res: any) => {
      if (res.success) {
        this.loadDistribution(res.data.distribution);
        this.loadTopSuppliers(res.data.topSuppliers);
        this.loadBottomSuppliers(res.data.bottomSuppliers);
        this.loadTopSuppliersLast3Years(res.data.topSuppliersLast3Years);
        this.loadBottomSuppliersLast3Years(res.data.bottomSuppliersLast3Years);
      }
    });
  }

  // ── Data Loaders & Chart Updaters ────────────────────────────────────────

  private loadDistribution(data: any[]) {
    this.ratingList = data;

    // Map rating string to standard colors
    const colorMap: { [key: string]: string } = {
      'Excellent': '#e74c3c', // Red (as per original code)
      'Good': '#27ae60',      // Green
      'Average': '#f39c12',   // Orange/Yellow
      'Poor': '#3498db'       // Blue
    };

    const pieData = data.map(item => ({
      name: item.rating,
      y: item.percentage,
      color: colorMap[item.rating] || '#95a5a6'
    }));

    this.performancePieOptions = {
      ...this.performancePieOptions,
      series: [{
        type: 'pie',
        data: pieData
      }]
    };
  }

  private loadTopSuppliers(data: any[]) {
    this.top10Year = data;
    const categories = data.map(item => item.supplierName);
    const seriesData = data.map(item => item.score);
    this.top10YearOptions = this.buildBarOptions(categories, seriesData);
  }

  private loadBottomSuppliers(data: any[]) {
    this.bottom10Year = data;
    const categories = data.map(item => item.supplierName);
    const seriesData = data.map(item => item.score);
    this.bottom10YearOptions = this.buildBarOptions(categories, seriesData);
  }

  private loadTopSuppliersLast3Years(data: any[]) {
    this.top10LastYears = data;
    const categories = data.map(item => item.supplierName);
    const seriesData = data.map(item => item.score);
    this.top10LastYearsOptions = this.buildBarOptions(categories, seriesData);
  }

  private loadBottomSuppliersLast3Years(data: any[]) {
    this.bottom10LastYears = data;
    const categories = data.map(item => item.supplierName);
    const seriesData = data.map(item => item.score);
    this.bottom10LastYearsOptions = this.buildBarOptions(categories, seriesData);
  }

  // ── Helper Chart Configurations ──────────────────────────────────────────

  private getInitialPieOptions(): Highcharts.Options {
    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: 400
      },
      title: { text: '' },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.y:.1f}%'
          },
          showInLegend: false
        }
      },
      series: [{ type: 'pie', data: [] }]
    };
  }

  private buildBarOptions(categories: string[], data: number[]): Highcharts.Options {
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 400
      },
      title: { text: '' },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        categories: categories,
        labels: { rotation: -25, style: { fontSize: '11px' } }
      },
      yAxis: {
        min: 0,
        title: { text: '' },
        gridLineColor: '#e0e0e0'
      },
      legend: { enabled: false }, // Hiding legend to save space since color changes per point
      plotOptions: {
        column: {
          colorByPoint: true,
          borderWidth: 0
        }
      },
      series: [{
        type: 'column',
        name: 'Score',
        data: data
      }]
    };
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}