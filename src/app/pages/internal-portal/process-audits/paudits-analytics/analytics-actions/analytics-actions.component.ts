import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { finalize } from 'rxjs/operators';
import { ProcessAuditService } from '../../process-audit.service';
import { ProcessAnalyticsService } from '../process-analytics.service';

@Component({
  standalone: false,
  selector: 'app-analytics-actions',
  templateUrl: './analytics-actions.component.html',
  styleUrls: ['./analytics-actions.component.scss']
})
export class AnalyticsActionsComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  // Filter Models
  selectedCommodity: any = null;
  selectedYear: number = new Date().getFullYear();
  commodities: any[] = [];
  years: number[] = [2023, 2024, 2025, 2026];
  isLoading: boolean = false;

  // private months = [
  //   'March', 'April', 'May', 'June', 'July', 'August',
  //   'September', 'October', 'November', 'December', 'January', 'February'
  // ];


  private months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  // Aging Table Data
  agingList: any[] = [];

  // Charts
  criticalOptions: Highcharts.Options = this.buildMonthlyBar([]);
  importantOptions: Highcharts.Options = this.buildMonthlyBar([]);
  logVsResolvedOptions: Highcharts.Options = this.buildLogVsResolved([], []);
  agingPieOptions: Highcharts.Options = this.buildAgingPie([]);

  constructor(
    private analyticsApi: ProcessAnalyticsService,
    private auditApi: ProcessAuditService
  ) {}

  ngOnInit(): void {
    this.loadCommodities();
    this.loadAnalytics();
  }

  clearFilter(): void {
    this.selectedCommodity = null;
    this.selectedYear = new Date().getFullYear();
    this.loadAnalytics();
  }

  loadCommodities(): void {
    this.auditApi.getCommodities().subscribe((res: any) => {
      if (res && res.success) {
        this.commodities = res.data || [];
      }
    });
  }

  loadAnalytics(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.analyticsApi.getActionsAnalytics(this.selectedCommodity, this.selectedYear)
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            const d = res.data;

            // 1. Update Monthly Critical Actions Chart
            this.criticalOptions = this.buildMonthlyBar(d.criticalMonthly || []);

            // 2. Update Monthly Important Actions Chart
            this.importantOptions = this.buildMonthlyBar(d.importantMonthly || []);

            // 3. Update Logged vs Resolved Chart
            this.logVsResolvedOptions = this.buildLogVsResolved(d.loggedMonthly || [], d.resolvedMonthly || []);

            // 4. Update Aging Table & Pie Chart
            if (Array.isArray(d.agingAnalysis)) {
              this.agingList = d.agingAnalysis.map((item: any) => ({
                period: item.period,
                action: `${item.percentage}% (${item.count})`
              }));

              const pieColors = ['#ff4d4f', '#20c997', '#0dcaf0', '#fd7e14', '#6f42c1', '#ffc107', '#0d6efd'];
              const pieData = d.agingAnalysis.map((item: any, idx: number) => ({
                name: item.period,
                y: item.percentage,
                color: pieColors[idx % pieColors.length]
              }));
              this.agingPieOptions = this.buildAgingPie(pieData);
            }
          }
        },
        error: (err) => {
          console.error('Failed to load actions analytics', err);
        }
      });
  }

  private buildMonthlyBar(data: number[]): Highcharts.Options {
    return {
      chart: { type: 'column', backgroundColor: 'transparent', spacingRight: 15, spacingBottom: 15 },
      title: { text: '' },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: this.months, labels: { style: { fontSize: '11px' } } },
      yAxis: { min: 0, title: { text: 'Count' }, gridLineColor: '#e0e0e0', allowDecimals: false },
      legend: { enabled: false },
      plotOptions: { column: { colorByPoint: true, borderWidth: 0, pointPadding: 0.05, groupPadding: 0.05 } },
      series: [{ type: 'column', name: 'Actions Logged', data }]
    };
  }

  private buildLogVsResolved(logged: number[], resolved: number[]): Highcharts.Options {
    return {
      chart: { type: 'column', backgroundColor: 'transparent', spacingRight: 15, spacingBottom: 15 },
      title: { text: '' },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: this.months, labels: { style: { fontSize: '11px' } } },
      yAxis: { min: 0, title: { text: 'Count' }, gridLineColor: '#e0e0e0', allowDecimals: false },
      legend: { enabled: true },
      plotOptions: { column: { borderWidth: 0, pointPadding: 0.1, groupPadding: 0.2 } },
      series: [
        { type: 'column', name: 'Resolved', color: '#4C9CA0', data: resolved },
        { type: 'column', name: 'Logged', color: '#6b6bb0', data: logged }
      ]
    };
  }

  private buildAgingPie(data: any[]): Highcharts.Options {
    return {
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: { text: '' },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y:.1f}%', style: { fontSize: '11px', fontWeight: 'bold' } },
          showInLegend: false
        }
      },
      series: [{ type: 'pie', name: 'Percentage', data }]
    };
  }
}