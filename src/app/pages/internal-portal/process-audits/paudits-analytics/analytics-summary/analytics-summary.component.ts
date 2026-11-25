// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import * as Highcharts from 'highcharts';
// import { finalize } from 'rxjs/operators';
// import { ProcessAnalyticsService } from '../process-analytics.service';
// import { ProcessAuditService } from '../../process-audit.service';
 
// @Component({
//   standalone: false,
//   selector: 'app-analytics-summary',
//   templateUrl: './analytics-summary.component.html',
//   styleUrls: ['./analytics-summary.component.scss']
// })
// export class AnalyticsSummaryComponent implements OnInit {

//   Highcharts: typeof Highcharts = Highcharts;
//   filterForm!: FormGroup;

//   commodities: any[] = [];
//   auditors: any[] = [];
//   isLoading: boolean = false;

//   tableData = {
//     checked: 0,
//     nc: 0,
//     safety: 0,
//     critical: 0,
//     important: 0,
//     fitment: 0,
//     regular: 0
//   };

//   private piePlotOptions: Highcharts.Options['plotOptions'] = {
//     pie: {
//       size: '80%',
//       allowPointSelect: true,
//       cursor: 'pointer',
//       borderWidth: 0,
//       borderColor: '#ffffff',
//       dataLabels: {
//         enabled: true,
//         format: '<b>{point.name}</b>: {point.percentage:.1f}%',
//         distance: 15
//       },
//       showInLegend: false
//     }
//   };

//   distributionByClassOptions: Highcharts.Options = {};
//   issuesCorrectedOptions: Highcharts.Options = {};
//   pdcaDistributionOptions: Highcharts.Options = {};

//   constructor(
//     private fb: FormBuilder,
//     private analyticsService: ProcessAnalyticsService,
//     private auditService: ProcessAuditService
//   ) {
//     const currentYear = new Date().getFullYear().toString();

//     this.filterForm = this.fb.group({
//       commodityId: [null],
//       auditorId: [null],
//       year: [currentYear],
//       month: [null]
//     });
//   }

//   ngOnInit(): void {
//     this.initEmptyCharts();
//     this.loadDropdowns();
//     this.loadSummaryData();
//   }

//   clearFilter(): void {
//     const currentYear = new Date().getFullYear().toString();
//     this.filterForm.reset({
//       commodityId: null,
//       auditorId: null,
//       year: currentYear,
//       month: null
//     });
//     this.onSearch();
//   }

//   loadDropdowns(): void {
//     this.auditService.getCommodities().subscribe((res: any) => {
//       if (res && res.success) this.commodities = res.data || [];
//     });

//     this.auditService.getUsers().subscribe((res: any) => {
//       if (res && res.success && Array.isArray(res.data)) {
//         this.auditors = res.data.filter((u: any) => u.isAuditor === true);
//       }
//     });
//   }

//   onSearch(): void {
//     this.loadSummaryData();
//   }

//   loadSummaryData(): void {
//     if (this.isLoading) return;
//     this.isLoading = true;
//     const { commodityId, auditorId, year, month } = this.filterForm.value;

//     this.analyticsService.getSummaryAnalytics(commodityId, auditorId, Number(year), Number(month))
//       .pipe(finalize(() => { this.isLoading = false; }))
//       .subscribe({
//         next: (res: any) => {
//           if (res && res.success && res.data) {
//             const t = res.data.tableData || {};
//             this.tableData = {
//               checked: t.checked || 0,
//               nc: t.nc || 0,
//               safety: t.safety || 0,
//               critical: t.critical || 0,
//               important: t.important || 0,
//               fitment: t.fitment || 0,
//               regular: t.regular || 0
//             };

//             this.distributionByClassOptions = this.buildPieChart('Distribution by Class', res.data.classDistribution || []);
//             this.issuesCorrectedOptions = this.buildPieChart('Issues Corrected', res.data.issuesCorrected || []);
//             this.pdcaDistributionOptions = this.buildPieChart('PDCA Distribution', res.data.pdcaDistribution || []);
//           } else {
//             this.initEmptyCharts();
//           }
//         },
//         error: (err) => {
//           console.error('Failed to load Summary analytics', err);
//           this.initEmptyCharts();
//         }
//       });
//   }

//   private buildPieChart(title: string, dataPoints: any[]): Highcharts.Options {
//     return {
//       chart: { type: 'pie', backgroundColor: 'transparent' },
//       title: { text: title },
//       credits: { enabled: false },
//       tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}% ({point.y} items)</b>' },
//       plotOptions: this.piePlotOptions,
//       series: [{
//         type: 'pie',
//         name: 'CAPAs',
//         data: dataPoints.length > 0 ? dataPoints : [{ name: 'No Data', y: 1, color: '#e0e0e0' }]
//       }]
//     };
//   }

//   initEmptyCharts(): void {
//     this.distributionByClassOptions = this.buildPieChart('Distribution by Class', []);
//     this.issuesCorrectedOptions = this.buildPieChart('Issues Corrected', []);
//     this.pdcaDistributionOptions = this.buildPieChart('PDCA Distribution', []);
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { finalize } from 'rxjs/operators';
import { ProcessAnalyticsService } from '../process-analytics.service';
import { ProcessAuditService } from '../../process-audit.service';

@Component({
  standalone: false,
  selector: 'app-analytics-summary',
  templateUrl: './analytics-summary.component.html',
  styleUrls: ['./analytics-summary.component.scss']
})
export class AnalyticsSummaryComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  commodities: any[] = [];
  auditors: any[] = [];
  isLoading: boolean = false;

  // 1. UNIQUE SCREEN NAME (Change this for each of your 16 screens)
  private readonly SCREEN_NAME = 'ProcessAnalyticsSummary';

  // 2. GET CURRENT USER ID (Grabs from localStorage or defaults to 0)
  private get currentUserId(): number {
    const userId = localStorage.getItem('UserId') || sessionStorage.getItem('UserId');
    return userId ? parseInt(userId, 10) : 0; 
  }

  tableData = {
    checked: 0,
    nc: 0,
    safety: 0,
    critical: 0,
    important: 0,
    fitment: 0,
    regular: 0
  };

  private piePlotOptions: Highcharts.Options['plotOptions'] = {
    pie: {
      size: '80%',
      allowPointSelect: true,
      cursor: 'pointer',
      borderWidth: 0,
      borderColor: '#ffffff',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
        distance: 15
      },
      showInLegend: false
    }
  };

  distributionByClassOptions: Highcharts.Options = {};
  issuesCorrectedOptions: Highcharts.Options = {};
  pdcaDistributionOptions: Highcharts.Options = {};

  constructor(
    private fb: FormBuilder,
    private analyticsService: ProcessAnalyticsService,
    private auditService: ProcessAuditService
  ) {
    const currentYear = new Date().getFullYear().toString();

    this.filterForm = this.fb.group({
      commodityId: [null],
      auditorId: [null],
      year: [currentYear],
      month: [null]
    });
  }

  ngOnInit(): void {
    this.initEmptyCharts();
    this.loadDropdowns();
    
    // 3. RESTORE FILTERS FROM DB (This will automatically trigger loadSummaryData when done)
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
            // Apply the saved values to the form
            this.filterForm.patchValue({
              commodityId: parsed.commodityId !== undefined ? parsed.commodityId : null,
              auditorId: parsed.auditorId !== undefined ? parsed.auditorId : null,
              year: parsed.year || new Date().getFullYear().toString(),
              month: parsed.month !== undefined ? parsed.month : null
            });
          } catch (e) {
            console.error('Failed to parse DB filters', e);
          }
        }
        // Load data AFTER filters are restored
        this.loadSummaryData();
      },
      error: () => {
        // If API fails, just load data with default filters
        this.loadSummaryData();
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
    // Fire and forget (no need to subscribe to response for UI blocking)
    this.analyticsService.saveUserFilters(payload).subscribe();
  }

  clearFilter(): void {
    const currentYear = new Date().getFullYear().toString();
    this.filterForm.reset({
      commodityId: null,
      auditorId: null,
      year: currentYear,
      month: null
    });
    
    // Save empty state to DB so it doesn't reload old filters next time
    this.saveCurrentFiltersToDb();
    
    this.loadSummaryData();
  }

  loadDropdowns(): void {
    this.auditService.getCommodities().subscribe((res: any) => {
      if (res && res.success) this.commodities = res.data || [];
    });

    this.auditService.getUsers().subscribe((res: any) => {
      if (res && res.success && Array.isArray(res.data)) {
        this.auditors = res.data.filter((u: any) => u.isAuditor === true);
      }
    });
  }

  onSearch(): void {
    // 4. SAVE FILTERS TO DB ON GO CLICK
    this.saveCurrentFiltersToDb();
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    const { commodityId, auditorId, year, month } = this.filterForm.value;

    this.analyticsService.getSummaryAnalytics(commodityId, auditorId, Number(year), Number(month))
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            const t = res.data.tableData || {};
            this.tableData = {
              checked: t.checked || 0,
              nc: t.nc || 0,
              safety: t.safety || 0,
              critical: t.critical || 0,
              important: t.important || 0,
              fitment: t.fitment || 0,
              regular: t.regular || 0
            };

            this.distributionByClassOptions = this.buildPieChart('Distribution by Class', res.data.classDistribution || []);
            this.issuesCorrectedOptions = this.buildPieChart('Issues Corrected', res.data.issuesCorrected || []);
            this.pdcaDistributionOptions = this.buildPieChart('PDCA Distribution', res.data.pdcaDistribution || []);
          } else {
            this.initEmptyCharts();
          }
        },
        error: (err) => {
          console.error('Failed to load Summary analytics', err);
          this.initEmptyCharts();
        }
      });
  }

  private buildPieChart(title: string, dataPoints: any[]): Highcharts.Options {
    return {
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: { text: title },
      credits: { enabled: false },
      tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}% ({point.y} items)</b>' },
      plotOptions: this.piePlotOptions,
      series: [{
        type: 'pie',
        name: 'CAPAs',
        data: dataPoints.length > 0 ? dataPoints : [{ name: 'No Data', y: 1, color: '#e0e0e0' }]
      }]
    };
  }

  initEmptyCharts(): void {
    this.distributionByClassOptions = this.buildPieChart('Distribution by Class', []);
    this.issuesCorrectedOptions = this.buildPieChart('Issues Corrected', []);
    this.pdcaDistributionOptions = this.buildPieChart('PDCA Distribution', []);
  }
}