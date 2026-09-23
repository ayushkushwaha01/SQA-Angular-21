import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ProcessAnalyticsService } from '../process-analytics.service';
import { ProcessAuditService } from '../../process-audit.service';

@Component({
  standalone: false,
  selector: 'app-analytics-bellcurve',
  templateUrl: './analytics-bellcurve.component.html',
  styleUrls: ['./analytics-bellcurve.component.scss']
})
export class AnalyticsBellcurveComponent implements OnInit {

  filterForm!: FormGroup;
  commodities: any[] = [];
  chartOptions: any = {};
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private analyticsService: ProcessAnalyticsService,
    private auditService: ProcessAuditService
  ) {
    const currentYear = new Date().getFullYear().toString();

    this.filterForm = this.fb.group({
      commodityId: [null],
      year: [currentYear]
    });
  }

  ngOnInit(): void {
    this.initChart([]);
    this.loadCommodities();
    this.loadBellCurveData();
  }

  clearFilter(): void {
    const currentYear = new Date().getFullYear().toString();
    this.filterForm.reset({
      commodityId: null,
      year: currentYear
    });
    this.loadBellCurveData();
  }

  loadCommodities(): void {
    this.auditService.getCommodities().subscribe((res: any) => {
      if (res && res.success) {
        this.commodities = res.data || [];
      }
    });
  }

  loadBellCurveData(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    const { commodityId, year } = this.filterForm.value;

    this.analyticsService.getBellCurveAnalytics(commodityId, Number(year))
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            this.initChart(res.data);
          }
        },
        error: () => console.error('Failed to load bell curve data')
      });
  }

  formatDataPoints(dataPoints: any[]): any[] {
    const defaultRanges = [
      "0-10", "10-20", "20-30", "30-40", "40-50",
      "50-60", "60-70", "70-80", "80-90", "90-100"
    ];

    const map = new Map<string, number>();
    if (Array.isArray(dataPoints)) {
      dataPoints.forEach(item => {
        if (item && item.label) {
          map.set(item.label.toString().trim(), item.y || 0);
        }
      });
    }

    return defaultRanges.map(label => ({
      label,
      y: map.has(label) ? map.get(label) : 0
    }));
  }

  initChart(rawPoints: any[]): void {
    const formattedPoints = this.formatDataPoints(rawPoints);
    const maxY = Math.max(...formattedPoints.map(p => p.y || 0), 0);

    const axisYConfig: any = {
      minimum: 0,
      gridColor: "#e6e6e6",
      gridThickness: 1,
      lineThickness: 0,
      tickThickness: 0,
      labelFontFamily: "Arial, sans-serif",
      labelFontColor: "#777"
    };

    // Only set explicit interval for small counts (to avoid fractional decimals like 0.5, 1.5).
    // For larger counts, CanvasJS automatically calculates clean, non-overlapping intervals (e.g., 20, 50, 100).
    if (maxY <= 5) {
      axisYConfig.interval = 1;
    } else if (maxY <= 10) {
      axisYConfig.interval = 2;
    }

    this.chartOptions = {
      animationEnabled: true,
      creditText: "",
      creditHref: "",
      theme: "light2",
      title: {
        text: "Bell Curve for Process Audits",
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        fontSize: 24,
        margin: 30
      },
      axisX: {
        labelFontFamily: "Arial, sans-serif",
        labelFontColor: "#777",
        tickThickness: 0,
        lineThickness: 1,
        lineColor: "#d3d3d3",
        margin: 10
      },
      axisY: axisYConfig,
      data: [{
        type: "column",
        color: "#8cd3ef", // Light blue matching your screenshot
        dataPoints: formattedPoints
      }]
    };
  }
}