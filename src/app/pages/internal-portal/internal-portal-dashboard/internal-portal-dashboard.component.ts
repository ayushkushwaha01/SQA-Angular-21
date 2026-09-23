import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { InternalPortalDashboardService } from './internal-portal-dashboard.service';
import { UserPermissionService } from '../../helpers/user-permission.service';

@Component({
  selector: 'app-internal-portal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    HighchartsChartModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './internal-portal-dashboard.component.html',
  styleUrls: ['./internal-portal-dashboard.component.scss'],
})
export class InternalPortalDashboardComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  // Data bindings
  dashboardData: any = null;
  commodities: any[] = [];
  severities: any[] = [];
  years = ['2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  // Local widget filter selections
  localProcessCommodityId: number | null = null;
  localPartsCommodityId: number | null = null;

  // NATIVE CHART REFERENCES & STORED DATA
  processChartRef: Highcharts.Chart | null = null;
  partsChartRef: Highcharts.Chart | null = null;
  trendChartRef: Highcharts.Chart | null = null;
  chartsData: any = null;

  onProcessChartInstance(chart: Highcharts.Chart): void {
    this.processChartRef = chart;
    if (chart?.series?.length > 0 && this.chartsData?.processAudits) {
      chart.series[0].setData(this.chartsData.processAudits, true, true, true);
      setTimeout(() => chart?.reflow(), 100);
    }
  }

  onPartsChartInstance(chart: Highcharts.Chart): void {
    this.partsChartRef = chart;
    if (chart?.series?.length > 0 && this.chartsData?.partsAudits) {
      chart.series[0].setData(this.chartsData.partsAudits, true, true, true);
      setTimeout(() => chart?.reflow(), 100);
    }
  }

  onTrendChartInstance(chart: Highcharts.Chart): void {
    this.trendChartRef = chart;
    if (chart?.series?.length > 1 && this.chartsData) {
      if (this.chartsData.trendCategories && chart.xAxis?.length > 0) {
        chart.xAxis[0].setCategories(this.chartsData.trendCategories, false);
      }
      if (this.chartsData.processMonthly) {
        chart.series[0].setData(this.chartsData.processMonthly, false, false, false);
      }
      if (this.chartsData.partsMonthly) {
        chart.series[1].setData(this.chartsData.partsMonthly, true, true, true);
      }
      setTimeout(() => chart?.reflow(), 100);
    }
  }

  // BASE CONFIGURATION
  getBaseOptions(isTrend: boolean = false): Highcharts.Options {
    return {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: undefined },
      colors: ['#6b69a6', '#55c898'],
      xAxis: {
        categories: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
        lineColor: '#ccc',
        tickColor: 'transparent'
      },
      yAxis: {
        min: 0,
        title: { text: undefined },
        gridLineColor: '#f0f0f0'
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { fontSize: '11px', color: '#555', fontWeight: 'bold' },
        symbolRadius: 0
      },
      exporting: { enabled: false },
      credits: { enabled: false },
      plotOptions: { column: { pointPadding: 0.1, borderWidth: 0, groupPadding: 0.2 } },
      series: isTrend
        ? [{ type: 'column', name: 'Process Audits', data: [] }, { type: 'column', name: 'Parts Audit', data: [] }]
        : [{ type: 'column', name: 'Actual', data: [] }]
    };
  }

  // Initialize options
  partsAuditOptions: Highcharts.Options = this.getBaseOptions();
  processAuditOptions: Highcharts.Options = this.getBaseOptions();
  monthlyTrendOptions: Highcharts.Options = this.getBaseOptions(true);

  constructor(private fb: FormBuilder, private api: InternalPortalDashboardService) {
    this.filterForm = this.fb.group({
      commodityId: [null],
      severityId: [null],
      finYear: ['2026-2027']
    });
  }

  canRead: boolean = false;
  readonly SCREEN_ID: number = 1; // Screen ID for Process Analytics

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    if (!this.canRead) return;
    this.loadDropdowns();
    this.loadDashboard();
  }

  onTableWheel(event: WheelEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    target.scrollTop += event.deltaY;
  }

  loadDropdowns() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) this.commodities = res.data;
    });
    this.api.getSeverities().subscribe((res: any) => {
      if (res.success) this.severities = res.data;
    });
  }

  loadDashboard() {
    const filters = this.filterForm.value;

    // Sync the local widget dropdowns with the global filter selection
    this.localProcessCommodityId = filters.commodityId;
    this.localPartsCommodityId = filters.commodityId;

    this.api.getDashboardData(filters.finYear, filters.commodityId, filters.severityId)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.dashboardData = res.data;
            this.updateCharts(res.data.charts);
          }
        },
        error: (err: any) => console.error("Failed to load dashboard data", err)
      });
  }

  // DIRECT DATA INJECTION (Bypasses Angular wrapper bugs)
  updateCharts(chartsData: any) {
    if (!chartsData) return;
    this.chartsData = chartsData;

    if (this.processChartRef && this.processChartRef.series?.length > 0 && chartsData.processAudits) {
      this.processChartRef.series[0].setData(chartsData.processAudits, true, true, true);
      this.processChartRef.reflow();
    }

    if (this.partsChartRef && this.partsChartRef.series?.length > 0 && chartsData.partsAudits) {
      this.partsChartRef.series[0].setData(chartsData.partsAudits, true, true, true);
      this.partsChartRef.reflow();
    }

    if (this.trendChartRef && this.trendChartRef.series?.length > 1) {
      if (chartsData.trendCategories) {
        this.trendChartRef.xAxis[0].setCategories(chartsData.trendCategories, false);
      }
      if (chartsData.processMonthly) {
        this.trendChartRef.series[0].setData(chartsData.processMonthly, false, false, false);
      }
      if (chartsData.partsMonthly) {
        this.trendChartRef.series[1].setData(chartsData.partsMonthly, true, true, true);
      }
      this.trendChartRef.reflow();
    }
  }

  onFilterSubmit() {
    this.loadDashboard();
  }

  onClearFilter() {
    this.filterForm.patchValue({
      commodityId: null,
      severityId: null,
      finYear: '2026-2027'
    });
    this.loadDashboard();
  }

  // --- LOCAL WIDGET FILTER EVENTS ---

  onProcessCommodityChange(commodityId: number | null) {
    this.localProcessCommodityId = commodityId;
    const finYear = this.filterForm.value.finYear;

    this.api.getProcessChartData(finYear, commodityId ? commodityId : undefined).subscribe({
      next: (res: any) => {
        if (res.success && this.processChartRef && this.processChartRef.series.length > 0) {
          this.processChartRef.series[0].setData(res.data, true, false, false);
        }
      }
    });
  }

  onPartsCommodityChange(commodityId: number | null) {
    this.localPartsCommodityId = commodityId;
    const finYear = this.filterForm.value.finYear;

    this.api.getPartsChartData(finYear, commodityId ? commodityId : undefined).subscribe({
      next: (res: any) => {
        if (res.success && this.partsChartRef && this.partsChartRef.series.length > 0) {
          this.partsChartRef.series[0].setData(res.data, true, false, false);
        }
      }
    });
  }
}