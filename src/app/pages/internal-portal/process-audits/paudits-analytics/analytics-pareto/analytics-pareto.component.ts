// import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import * as Highcharts from 'highcharts';
// import { finalize } from 'rxjs/operators';
// import { ProcessAnalyticsService } from '../process-analytics.service';
// import { ProcessAuditService } from '../../process-audit.service';

// @Component({
//   standalone: false,
//   selector: 'app-analytics-pareto',
//   templateUrl: './analytics-pareto.component.html',
//   styleUrls: ['./analytics-pareto.component.scss']
// })
// export class AnalyticsParetoComponent implements OnInit, AfterViewInit {

//   Highcharts: typeof Highcharts = Highcharts;
//   filterForm!: FormGroup;

//   commodities: any[] = [];
//   years = ['2022', '2023', '2024', '2025', '2026', '2027'];
//   isLoading: boolean = false;

//   // Raw API lists
//   pareto: any[] = [];
//   commodityList: any[] = [];
//   statusList: any[] = [];
//   criticalList: any[] = [];

//   // Highcharts Config Objects
//   commodityPieOptions: Highcharts.Options = {};
//   statusPieOptions: Highcharts.Options = {};
//   criticalPieOptions: Highcharts.Options = {};

//   // Color Palettes
//   private pieColors = ['#0284c7', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#06b6d4', '#e11d48'];

//   constructor(
//     private fb: FormBuilder,
//     private analyticsService: ProcessAnalyticsService,
//     private auditService: ProcessAuditService
//   ) {
//     this.filterForm = this.fb.group({
//       commodityId: [null],
//       year: [null]
//     });
//   }

//   ngOnInit(): void {
//     this.initEmptyCharts();
//     this.loadDropdowns();
//     this.loadParetoData();
//   }

//   clearFilter(): void {
//     this.filterForm.reset({
//       commodityId: null,
//       year: null
//     });
//     this.onSearch();
//   }

//   loadDropdowns(): void {
//     this.auditService.getCommodities().subscribe((res: any) => {
//       if (res && res.success) this.commodities = res.data || [];
//     });
//   }

//   onSearch(): void {
//     this.loadParetoData();
//   }

//   loadParetoData(): void {
//     if (this.isLoading) return;
//     this.isLoading = true;
//     const { commodityId, year } = this.filterForm.value;

//     const reqYear = (year !== null && year !== undefined && year !== 'null' && year !== '') ? Number(year) : undefined;
//     const reqCommodity = (commodityId !== null && commodityId !== undefined && commodityId !== 'null' && commodityId !== '') ? Number(commodityId) : undefined;

//     this.analyticsService.getParetoAnalytics(reqCommodity, reqYear)
//       .pipe(finalize(() => { this.isLoading = false; }))
//       .subscribe({
//         next: (res: any) => {
//           if (res && res.success && res.data) {
//             const d = res.data;
//             this.commodityList = d.commodityList || d.criticalCategory || d.pareto || (Array.isArray(d) ? d : []);
//             this.pareto = this.commodityList;
//             this.statusList = d.statusList || d.importantCategory || [];
//             this.criticalList = d.criticalList || d.commodityDistribution || [];

//             this.updateCharts();
//           } else if (Array.isArray(res)) {
//             this.commodityList = res;
//             this.pareto = res;
//             this.updateCharts();
//           } else {
//             this.initEmptyCharts();
//           }
//         },
//         error: (err) => {
//           console.error('Failed to load Pareto analytics', err);
//           this.initEmptyCharts();
//         }
//       });
//   }

//   private updateCharts(): void {
//     this.commodityPieOptions = this.buildPieOptions(this.commodityList);
//     this.statusPieOptions = this.buildPieOptions(this.statusList);
//     this.criticalPieOptions = this.buildPieOptions(this.criticalList);
//   }

//   // Converts normalized list into Highcharts Pie Series
//   private buildPieOptions(dataList: any[]): Highcharts.Options {
//     const seriesData = (dataList || []).map((item, index) => ({
//       name: item.name || item.categoryName || item.commodityName || 'N/A',
//       y: Number(item.action || item.capa || item.count || item.y || 0),
//       color: this.pieColors[index % this.pieColors.length]
//     })).filter(point => point.y > 0);

//     return {
//       chart: { 
//         type: 'pie', 
//         backgroundColor: 'transparent',
//         spacing: [10, 10, 10, 10]
//       },
//       title: { text: '' },
//       credits: { enabled: false },
//       tooltip: {
//         backgroundColor: 'rgba(15, 23, 42, 0.92)',
//         borderColor: 'transparent',
//         borderRadius: 8,
//         style: { color: '#f8fafc', fontSize: '12px', fontWeight: '500' },
//         pointFormat: '<b>{point.name}</b>: <b>{point.y} CAPAs</b> ({point.percentage:.1f}%)',
//         shadow: true
//       },
//       plotOptions: {
//         pie: {
//           size: '80%',
//           center: ['35%', '50%'],
//           allowPointSelect: true,
//           cursor: 'pointer',
//           borderWidth: 0,
//           borderColor: '#ffffff',
//           dataLabels: {
//             enabled: true,
//             connectorWidth: 1,
//             distance: 12,
//             format: '<b>{point.percentage:.0f}%</b> ({point.y})',
//             style: {
//               fontSize: '12px',
//               fontWeight: '700',
//               color: '#1e293b',
//               textOutline: 'none'
//             }
//           },
//           showInLegend: true
//         }
//       },
//       legend: {
//         enabled: true,
//         align: 'right',
//         verticalAlign: 'middle',
//         layout: 'vertical',
//         width: 220,
//         itemStyle: {
//           fontSize: '12px',
//           fontWeight: '500',
//           color: '#334155',
//           textOverflow: 'none'
//         },
//         itemMarginBottom: 8
//       },
//       series: [{
//         type: 'pie',
//         name: 'CAPAs',
//         data: seriesData.length > 0 ? seriesData : []
//       }]
//     };
//   }

//   initEmptyCharts(): void {
//     this.pareto = [];
//     this.commodityList = [];
//     this.statusList = [];
//     this.criticalList = [];
//     this.commodityPieOptions = this.buildPieOptions([]);
//     this.statusPieOptions = this.buildPieOptions([]);
//     this.criticalPieOptions = this.buildPieOptions([]);
//   }

//   ngAfterViewInit(): void {
//     setTimeout(() => {
//       window.dispatchEvent(new Event('resize'));
//     }, 300);
//   }
// }

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { finalize } from 'rxjs/operators';
import { ProcessAnalyticsService } from '../process-analytics.service';
import { ProcessAuditService } from '../../process-audit.service';

@Component({
  standalone: false,
  selector: 'app-analytics-pareto',
  templateUrl: './analytics-pareto.component.html',
  styleUrls: ['./analytics-pareto.component.scss']
})
export class AnalyticsParetoComponent implements OnInit, AfterViewInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  commodities: any[] = [];
  years = ['2022', '2023', '2024', '2025', '2026', '2027'];
  isLoading: boolean = false;

  // 1. UNIQUE SCREEN NAME FOR THE DATABASE
  private readonly SCREEN_NAME = 'ProcessAnalyticsPareto';

  // 2. GET CURRENT USER ID (Grabs from localStorage or defaults to 0)
  private get currentUserId(): number {
    const userId = localStorage.getItem('UserId') || sessionStorage.getItem('UserId');
    return userId ? parseInt(userId, 10) : 0; 
  }

  // Raw API lists
  pareto: any[] = [];
  commodityList: any[] = [];
  statusList: any[] = [];
  criticalList: any[] = [];

  // Highcharts Config Objects
  commodityPieOptions: Highcharts.Options = {};
  statusPieOptions: Highcharts.Options = {};
  criticalPieOptions: Highcharts.Options = {};

  // Color Palettes
  private pieColors = ['#0284c7', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#06b6d4', '#e11d48'];

  constructor(
    private fb: FormBuilder,
    private analyticsService: ProcessAnalyticsService,
    private auditService: ProcessAuditService
  ) {
    this.filterForm = this.fb.group({
      commodityId: [null],
      year: [null]
    });
  }

  ngOnInit(): void {
    this.initEmptyCharts();
    this.loadDropdowns();
    
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
              year: parsed.year !== undefined ? parsed.year : null
            });
          } catch (e) {
            console.error('Failed to parse DB filters', e);
          }
        }
        // Load data AFTER filters are restored
        this.loadParetoData();
      },
      error: () => {
        // Fallback if API fails
        this.loadParetoData();
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
    this.filterForm.reset({
      commodityId: null,
      year: null
    });
    
    // Save the cleared state to DB
    this.saveCurrentFiltersToDb();
    
    this.loadParetoData();
  }

  loadDropdowns(): void {
    this.auditService.getCommodities().subscribe((res: any) => {
      if (res && res.success) this.commodities = res.data || [];
    });
  }

  onSearch(): void {
    this.loadParetoData();
  }

  loadParetoData(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    // 4. SAVE FILTERS TO DB EVERY TIME 'GO' IS CLICKED OR DATA IS REFRESHED
    this.saveCurrentFiltersToDb();

    const { commodityId, year } = this.filterForm.value;

    const reqYear = (year !== null && year !== undefined && year !== 'null' && year !== '') ? Number(year) : undefined;
    const reqCommodity = (commodityId !== null && commodityId !== undefined && commodityId !== 'null' && commodityId !== '') ? Number(commodityId) : undefined;

    this.analyticsService.getParetoAnalytics(reqCommodity, reqYear)
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            const d = res.data;
            this.commodityList = d.commodityList || d.criticalCategory || d.pareto || (Array.isArray(d) ? d : []);
            this.pareto = this.commodityList;
            this.statusList = d.statusList || d.importantCategory || [];
            this.criticalList = d.criticalList || d.commodityDistribution || [];

            this.updateCharts();
          } else if (Array.isArray(res)) {
            this.commodityList = res;
            this.pareto = res;
            this.updateCharts();
          } else {
            this.initEmptyCharts();
          }
        },
        error: (err) => {
          console.error('Failed to load Pareto analytics', err);
          this.initEmptyCharts();
        }
      });
  }

  private updateCharts(): void {
    this.commodityPieOptions = this.buildPieOptions(this.commodityList);
    this.statusPieOptions = this.buildPieOptions(this.statusList);
    this.criticalPieOptions = this.buildPieOptions(this.criticalList);
  }

  // Converts normalized list into Highcharts Pie Series
  private buildPieOptions(dataList: any[]): Highcharts.Options {
    const seriesData = (dataList || []).map((item, index) => ({
      name: item.name || item.categoryName || item.commodityName || 'N/A',
      y: Number(item.action || item.capa || item.count || item.y || 0),
      color: this.pieColors[index % this.pieColors.length]
    })).filter(point => point.y > 0);

    return {
      chart: { 
        type: 'pie', 
        backgroundColor: 'transparent',
        spacing: [10, 10, 10, 10]
      },
      title: { text: '' },
      credits: { enabled: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: 'transparent',
        borderRadius: 8,
        style: { color: '#f8fafc', fontSize: '12px', fontWeight: '500' },
        pointFormat: '<b>{point.name}</b>: <b>{point.y} CAPAs</b> ({point.percentage:.1f}%)',
        shadow: true
      },
      plotOptions: {
        pie: {
          size: '80%',
          center: ['35%', '50%'],
          allowPointSelect: true,
          cursor: 'pointer',
          borderWidth: 0,
          borderColor: '#ffffff',
          dataLabels: {
            enabled: true,
            connectorWidth: 1,
            distance: 12,
            format: '<b>{point.percentage:.0f}%</b> ({point.y})',
            style: {
              fontSize: '12px',
              fontWeight: '700',
              color: '#1e293b',
              textOutline: 'none'
            }
          },
          showInLegend: true
        }
      },
      legend: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        width: 220,
        itemStyle: {
          fontSize: '12px',
          fontWeight: '500',
          color: '#334155',
          textOverflow: 'none'
        },
        itemMarginBottom: 8
      },
      series: [{
        type: 'pie',
        name: 'CAPAs',
        data: seriesData.length > 0 ? seriesData : []
      }]
    };
  }

  initEmptyCharts(): void {
    this.pareto = [];
    this.commodityList = [];
    this.statusList = [];
    this.criticalList = [];
    this.commodityPieOptions = this.buildPieOptions([]);
    this.statusPieOptions = this.buildPieOptions([]);
    this.criticalPieOptions = this.buildPieOptions([]);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }
}