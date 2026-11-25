// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import * as Highcharts from 'highcharts';
// import HC_exporting from 'highcharts/modules/exporting';
// import HC_exportData from 'highcharts/modules/export-data';
// import HC_accessibility from 'highcharts/modules/accessibility';
// import { finalize } from 'rxjs/operators';
// import { ProcessAnalyticsService } from '../process-analytics.service';
 
// const initPlugin = (plugin: any, hc: any) => {
//   if (typeof plugin === 'function') {
//     plugin(hc);
//   } else if (plugin?.default && typeof plugin.default === 'function') {
//     plugin.default(hc);
//   }
// };
// initPlugin(HC_exporting, Highcharts);
// initPlugin(HC_exportData, Highcharts);
// initPlugin(HC_accessibility, Highcharts);

// @Component({
//   standalone: false,
//   selector: 'app-analytics-scatter',
//   templateUrl: './analytics-scatter.component.html',
//   styleUrls: ['./analytics-scatter.component.scss']
// })
// export class AnalyticsScatterComponent implements OnInit {

//   Highcharts: typeof Highcharts = Highcharts;
//   chartOptions: Highcharts.Options = {};
//   filterForm!: FormGroup;

//   auditData: [number, number][] = [];
//   isLoading: boolean = false;
//   updateFlag: boolean = false;
//   hasNoData: boolean = false;

//   constructor(
//     private fb: FormBuilder,
//     private analyticsService: ProcessAnalyticsService
//   ) {
//     const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
//     const currentYear = new Date().getFullYear().toString();

//     this.filterForm = this.fb.group({
//       month: [currentMonthName],
//       year: [currentYear]
//     });
//   }

//   ngOnInit(): void {
//     this.initChart();
//     this.loadScatterData();
//   }

//   clearFilter(): void {
//     const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
//     const currentYear = new Date().getFullYear().toString();
//     this.filterForm.reset({
//       month: currentMonthName,
//       year: currentYear
//     });
//     this.loadScatterData();
//   }

//   loadScatterData(): void {
//     if (this.isLoading) return;
//     this.isLoading = true;
//     const month = this.filterForm?.value?.month || new Date().toLocaleString('en-US', { month: 'long' });
//     const year = this.filterForm?.value?.year || new Date().getFullYear().toString();

//     this.analyticsService.getScatterAnalytics(month, Number(year))
//       .pipe(finalize(() => { this.isLoading = false; }))
//       .subscribe({
//         next: (res: any) => {
//           if (res && res.success && Array.isArray(res.data)) {
//             this.auditData = res.data;
//           } else if (Array.isArray(res)) {
//             this.auditData = res;
//           } else {
//             this.auditData = [];
//           }
//           this.hasNoData = this.auditData.length === 0;
//           this.updateChart();
//         },
//         error: (err) => {
//           this.auditData = [];
//           this.hasNoData = true;
//           console.error('Failed to load scatter plot data', err);
//         }
//       });
//   }

//   initChart(): void {
//     this.chartOptions = {
//       chart: {
//         type: 'scatter',
//         backgroundColor: '#ffffff',
//         animation: false
//       },
//       title: {
//         text: 'Scatter plot for Process Audits',
//         style: {
//           fontSize: '24px',
//           fontWeight: 'normal',
//           color: '#333333'
//         },
//         margin: 40
//       },
//       xAxis: {
//         title: { text: 'Day of the Month' },
//         min: 1,
//         max: 31,
//         tickInterval: 1,
//         gridLineWidth: 0,
//         lineColor: '#ccd6eb',
//         tickColor: '#ccd6eb'
//       },
//       yAxis: {
//         title: { text: 'Score' },
//         min: 0,
//         max: 100,
//         tickInterval: 10,
//         gridLineColor: '#e6e6e6',
//         gridLineWidth: 1
//       },
//       legend: {
//         layout: 'horizontal',
//         align: 'left',
//         verticalAlign: 'top',
//         x: 60,
//         y: 60,
//         floating: true,
//         backgroundColor: '#ffffff',
//         borderWidth: 1,
//         borderColor: '#cccccc',
//         padding: 10,
//         itemStyle: { fontWeight: 'normal' }
//       },
//       plotOptions: {
//         scatter: {
//           animation: false,
//           marker: {
//             radius: 6,
//             symbol: 'circle',
//             states: {
//               hover: {
//                 enabled: true,
//                 lineColor: 'rgb(100,100,100)'
//               }
//             }
//           },
//           tooltip: {
//             headerFormat: '<b>Audit Score</b><br>',
//             pointFormat: 'Day: <b>{point.x}</b><br>Score: <b>{point.y}</b>'
//           }
//         }
//       },
//       series: [{
//         type: 'scatter',
//         name: 'Score',
//         color: '#b0c4de',
//         data: this.auditData
//       }],
//       exporting: {
//         enabled: true,
//         buttons: {
//           contextButton: {
//             symbolStroke: '#666',
//             theme: { fill: 'transparent' }
//           }
//         }
//       },
//       credits: { enabled: false }
//     };
//   }

//   updateChart(): void {
//     this.chartOptions = {
//       ...this.chartOptions,
//       series: [{
//         type: 'scatter',
//         name: 'Score',
//         color: '#b0c4de',
//         data: this.auditData
//       }]
//     };
//     this.updateFlag = true;
//   }

//   refreshData(): void {
//     this.loadScatterData();
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_accessibility from 'highcharts/modules/accessibility';
import { finalize } from 'rxjs/operators';
import { ProcessAnalyticsService } from '../process-analytics.service';
 
const initPlugin = (plugin: any, hc: any) => {
  if (typeof plugin === 'function') {
    plugin(hc);
  } else if (plugin?.default && typeof plugin.default === 'function') {
    plugin.default(hc);
  }
};
initPlugin(HC_exporting, Highcharts);
initPlugin(HC_exportData, Highcharts);
initPlugin(HC_accessibility, Highcharts);

@Component({
  standalone: false,
  selector: 'app-analytics-scatter',
  templateUrl: './analytics-scatter.component.html',
  styleUrls: ['./analytics-scatter.component.scss']
})
export class AnalyticsScatterComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  filterForm!: FormGroup;

  // 1. UNIQUE SCREEN NAME FOR THE DATABASE
  private readonly SCREEN_NAME = 'ProcessAnalyticsScatter';

  // 2. GET CURRENT USER ID (Grabs from localStorage or defaults to 0)
  private get currentUserId(): number {
    const userId = localStorage.getItem('UserId') || sessionStorage.getItem('UserId');
    return userId ? parseInt(userId, 10) : 0; 
  }

  auditData: [number, number][] = [];
  isLoading: boolean = false;
  updateFlag: boolean = false;
  hasNoData: boolean = false;

  constructor(
    private fb: FormBuilder,
    private analyticsService: ProcessAnalyticsService
  ) {
    const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear().toString();

    this.filterForm = this.fb.group({
      month: [currentMonthName],
      year: [currentYear]
    });
  }

  ngOnInit(): void {
    this.initChart();
    
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
              month: parsed.month || new Date().toLocaleString('en-US', { month: 'long' }),
              year: parsed.year || new Date().getFullYear().toString()
            });
          } catch (e) {
            console.error('Failed to parse DB filters', e);
          }
        }
        // Load data AFTER filters are restored
        this.loadScatterData();
      },
      error: () => {
        // Fallback if API fails
        this.loadScatterData();
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
    const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear().toString();
    this.filterForm.reset({
      month: currentMonthName,
      year: currentYear
    });
    
    // Save the cleared state to DB
    this.saveCurrentFiltersToDb();
    
    this.loadScatterData();
  }

  loadScatterData(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    // 4. SAVE FILTERS TO DB EVERY TIME 'GO' IS CLICKED OR DATA IS REFRESHED
    this.saveCurrentFiltersToDb();

    const month = this.filterForm?.value?.month || new Date().toLocaleString('en-US', { month: 'long' });
    const year = this.filterForm?.value?.year || new Date().getFullYear().toString();

    this.analyticsService.getScatterAnalytics(month, Number(year))
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res: any) => {
          if (res && res.success && Array.isArray(res.data)) {
            this.auditData = res.data;
          } else if (Array.isArray(res)) {
            this.auditData = res;
          } else {
            this.auditData = [];
          }
          this.hasNoData = this.auditData.length === 0;
          this.updateChart();
        },
        error: (err) => {
          this.auditData = [];
          this.hasNoData = true;
          console.error('Failed to load scatter plot data', err);
        }
      });
  }

  initChart(): void {
    this.chartOptions = {
      chart: {
        type: 'scatter',
        backgroundColor: '#ffffff',
        animation: false
      },
      title: {
        text: 'Scatter plot for Process Audits',
        style: {
          fontSize: '24px',
          fontWeight: 'normal',
          color: '#333333'
        },
        margin: 40
      },
      xAxis: {
        title: { text: 'Day of the Month' },
        min: 1,
        max: 31,
        tickInterval: 1,
        gridLineWidth: 0,
        lineColor: '#ccd6eb',
        tickColor: '#ccd6eb'
      },
      yAxis: {
        title: { text: 'Score' },
        min: 0,
        max: 100,
        tickInterval: 10,
        gridLineColor: '#e6e6e6',
        gridLineWidth: 1
      },
      legend: {
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        x: 60,
        y: 60,
        floating: true,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 10,
        itemStyle: { fontWeight: 'normal' }
      },
      plotOptions: {
        scatter: {
          animation: false,
          marker: {
            radius: 6,
            symbol: 'circle',
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          tooltip: {
            headerFormat: '<b>Audit Score</b><br>',
            pointFormat: 'Day: <b>{point.x}</b><br>Score: <b>{point.y}</b>'
          }
        }
      },
      series: [{
        type: 'scatter',
        name: 'Score',
        color: '#b0c4de',
        data: this.auditData
      }],
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            symbolStroke: '#666',
            theme: { fill: 'transparent' }
          }
        }
      },
      credits: { enabled: false }
    };
  }

  updateChart(): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        type: 'scatter',
        name: 'Score',
        color: '#b0c4de',
        data: this.auditData
      }]
    };
    this.updateFlag = true;
  }

  refreshData(): void {
    this.loadScatterData();
  }
}