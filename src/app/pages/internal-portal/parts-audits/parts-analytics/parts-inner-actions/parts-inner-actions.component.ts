import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { AlertService } from 'src/app/shared/alert.service';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';
import { PartAuditService } from '../../part-audit.service';

@Component({
  standalone: false,
  selector: 'app-parts-inner-actions',
  templateUrl: './parts-inner-actions.component.html',
  styleUrls: ['./parts-inner-actions.component.scss']
})
export class PartsInnerActionsComponent {

  constructor(private dialog: MatDialog, private fb: FormBuilder,
    private alertService: AlertService, private api: CommodityService, private PartsAuditAnalayticsService: PartsAuditAnalayticsService,
    private PartAuditService: PartAuditService
  ) { }

  years: number[] = [2023, 2024, 2025, 2026];
  filterForm!: FormGroup;

  ngOnInit(): void {
    console.log('AnalyticsActionsComponent ngOnInit');
    this.forminit();
    this.getCommodities();
    this.getanalaytics();
    this.getCapaAgingPercentage()
  }

  // forminit() {
  //   this.filterForm = this.fb.group({
  //     commodityId: [null],
  //     Year: [null],
  //   });
  // }

   forminit() {
    const currentDate = new Date();
    this.filterForm = this.fb.group({
      commodityId: [null],
      Year: [currentDate.getFullYear()],
    });
  }
  onClearFilter() {
    this.filterForm.reset({
      commodityId: null,
      Year: null,
    });
    this.getCapaAgingPercentage();
    this.getanalaytics();
  }
  originalTableData: any[] = [];
  getCommodities() {
    this.PartAuditService.getCommodityDD()
      .subscribe({
        next: (res: any) => {
          console.log('Commodities response:', res);
          if (res.success) {
            this.originalTableData = res.data;
          }
        },
        error: (err) => {
          console.error('Commodities API error:', err);
          this.alertService.createAlert(err.error?.message || 'Failed to load commodities', 0);
        }
      });
  }

  analytics: any[] = [];
  getanalaytics() {

    const filter = { ...this.filterForm.value };

    Object.keys(filter).forEach(key => {

      if (
        filter[key] === null ||
        filter[key] === undefined ||
        filter[key] === '' ||
        filter[key] === 'null'
      ) {
        delete filter[key];
      }

    });

    console.log(filter);

    this.PartsAuditAnalayticsService.getPartsAuditCapaaAnalytics(filter)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.analytics = res.data;
            this.buildChartsFromAnalytics(res.data);
          }
        },
        error: (err) => {
          console.error('Analytics API error:', err);
          this.alertService.createAlert(err.error?.message || 'Failed to load analytics', 0);
        }
      });
  }

  buildChartsFromAnalytics(data: any) {
    const criticalCategories = data.critical.map((m: any) => m.monthName);
    const criticalTotals = data.critical.map((m: any) => m.total);

    const importantCategories = data.important.map((m: any) => m.monthName);
    const importantTotals = data.important.map((m: any) => m.total);

    const combinedCategories = data.combined.map((m: any) => m.monthName);
    const combinedResolved = data.combined.map((m: any) => m.resolved);
    const combinedLog = data.combined.map((m: any) => m.total);

    // Note: reassign the whole object (new reference) so Highcharts picks up the change
    this.criticalOptions = this.buildMonthlyBar(criticalTotals, criticalCategories);
    this.importantOptions = this.buildMonthlyBar(importantTotals, importantCategories);

    this.logVsResolvedOptions = {
      ...this.logVsResolvedOptions,
      xAxis: { categories: combinedCategories, labels: { style: { fontSize: '11px' } } },
      series: [
        { type: 'column', name: 'Resolved', color: '#4C9CA0', data: combinedResolved },
        { type: 'column', name: 'Log', color: '#6b6bb0', data: combinedLog }
      ]
    };
  }
  Highcharts: typeof Highcharts = Highcharts;

  private months = [
    'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December', 'January', 'February'
  ];

  // Aging Analysis table data
  agingList = [
    { period: '0-10', action: '20%' },
    { period: '10-20', action: '30%' },
    { period: '20-30', action: '40%' },
    { period: '30-40', action: '50%' },
    { period: '40-50', action: '60%' },
    { period: '50-100', action: '70%' },
    { period: '100+', action: '80%' },
  ];

  // ── Charts ──────────────────────────────────────────────────────────────

  // criticalOptions: Highcharts.Options = this.buildMonthlyBar(
  //   [82, 75, 65, 70, 90, 85, 75, 65, 60, 80, 75, 60]
  // );
  private buildMonthlyBar(data: number[], categories?: string[]): Highcharts.Options {
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        spacingRight: 15,
        spacingBottom: 15,
        events: {
          load: function (this: any) {
            const c = this;
            setTimeout(() => c.reflow(), 0);
          }
        }
      },
      title: { text: '' },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        categories: categories || this.months,
        labels: { style: { fontSize: '11px' } }
      },
      yAxis: {
        min: 0,
        // max removed — Highcharts auto-scales to fit the data
        title: { text: '' },
        gridLineColor: '#e0e0e0',
        allowDecimals: false, // optional: prevents 0.5, 1.5 etc if your counts are integers
        tickAmount: 5         // optional: keeps a consistent number of gridlines (0,25,50... style look)
      },
      legend: { enabled: false },
      plotOptions: {
        column: { colorByPoint: true, borderWidth: 0, pointPadding: 0.05, groupPadding: 0.05 }
      },
      series: [{ type: 'column', name: 'Distribution', data }]
    };
  }
  // importantOptions: Highcharts.Options = this.buildMonthlyBar(
  //   [65, 75, 65, 70, 85, 80, 65, 60, 60, 55, 80, 57]
  // );

  logVsResolvedOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      spacingRight: 15,
      spacingBottom: 15,
      events: {
        load: function (this: any) {
          const c = this;
          setTimeout(() => c.reflow(), 0);
        }
      }
    },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
      categories: this.months,
      labels: { style: { fontSize: '11px' } }
    },
    yAxis: {
      min: 0,
      // max removed here too
      title: { text: '' },
      gridLineColor: '#e0e0e0',
      allowDecimals: false
    },
    legend: { enabled: true },
    plotOptions: {
      column: { borderWidth: 0, pointPadding: 0.1, groupPadding: 0.2 }
    },
    series: [
      { type: 'column', name: 'Resolved', color: '#4C9CA0', data: [] },
      { type: 'column', name: 'Log', color: '#6b6bb0', data: [] }
    ]
  };
  //agingList: { period: string; action: number }[] = [];
  totalCapas: number = 0;

  agingPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y:.1f}%',
          style: { fontSize: '11px', fontWeight: 'bold' }
        },
        showInLegend: false
      }
    },
    series: [{
      type: 'pie',
      name: 'Status',
      data: []
    }]
  };

  // Fixed color per range so colors stay consistent even if some ranges have 0%
  private agingColorMap: { [key: string]: string } = {
    '0-10 Days': 'red',
    '10-20 Days': 'green',
    '20-30 Days': 'skyblue',
    '30-40 Days': 'orange',
    '40-50 Days': 'purple',
    '50-100 Days': 'yellow',
    '100+ Days': 'blue'
  };

  getCapaAgingPercentage() {

    const filter = { ...this.filterForm.value };

    Object.keys(filter).forEach(key => {

      if (
        filter[key] === null ||
        filter[key] === undefined ||
        filter[key] === '' ||
        filter[key] === 'null'
      ) {
        delete filter[key];
      }

    });

    this.PartsAuditAnalayticsService.getPartsAuditCapaPercentage(filter)
      .subscribe({
        next: (res: any) => {
          if (res?.success && res?.data) {

            this.totalCapas = res.data.totalCapas;

            // Populate table
            this.agingList = res.data.aging.map((item: any) => ({
              period: item.range,
              action: item.count
            }));

            // Populate pie chart
            const pieData = res.data.aging.map((item: any) => ({
              name: item.range,
              y: item.percentage,
              color: this.agingColorMap[item.range] || '#999999'
            }));

            this.agingPieOptions = {
              ...this.agingPieOptions,
              series: [{
                type: 'pie',
                name: 'Status',
                data: pieData
              }]
            };

          } else {
            this.alertService.createAlert(
              res?.message || 'Failed to load aging data',
              0
            );
          }
        },
        error: (err) => {
          this.alertService.createAlert(
            err.error?.message || 'Error fetching CAPA aging data',
            0
          );
        }
      });
  }
  criticalOptions: Highcharts.Options = this.buildMonthlyBar([]);
  importantOptions: Highcharts.Options = this.buildMonthlyBar([]);

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
