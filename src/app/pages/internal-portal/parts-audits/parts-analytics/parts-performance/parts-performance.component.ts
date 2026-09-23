import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
// ✅ CHANGED: Use the wildcard import for Highcharts
import * as Highcharts from 'highcharts';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { AlertService } from 'src/app/shared/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { PartAuditService } from '../../part-audit.service';

@Component({
  standalone: false,
  selector: 'app-parts-performance',
  templateUrl: './parts-performance.component.html',
  styleUrls: ['./parts-performance.component.scss']
})
export class PartsPerformanceComponent {

  Highcharts: typeof Highcharts = Highcharts;


  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private alertService: AlertService,
    private api: CommodityService,
    private PartsAuditAnalayticsService: PartsAuditAnalayticsService,
    private manageUsersService: ManageUsersService,
    private PartAuditService: PartAuditService
  ) { }

  filterForm!: FormGroup;

  ngOnInit(): void {
    this.forminit();
    this.getCommodities();
    this.getPerformance();
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

  // forminit() {
  //   this.filterForm = this.fb.group({
  //     commodityId: [null],
  //     Year: [null],
  //   });
  // }

  years: number[] = [2023, 2024, 2025, 2026];
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
    this.getPerformance();


  }



  getPerformance() {

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

    this.PartsAuditAnalayticsService
      .getDashboardperformance(filter)
      .subscribe((res: any) => {

        if (res.success) {

          this.loadDistribution(res.data.distribution);

          this.loadTopSuppliers(res.data.topSuppliers);

          this.loadBottomSuppliers(res.data.bottomSuppliers);
          this.loadTopSuppliersLast3Years(res.data.topSuppliersLast3Years);

          this.loadBottomSuppliersLast3Years(res.data.bottomSuppliersLast3Years);

        }

      });

  }

  loadDistribution(data: any[]) {

    this.ratingList = data;

    this.performancePieOptions = {

      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: 400
      },

      title: {
        text: ''
      },

      credits: {
        enabled: false
      },

      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.y:.2f}%'
          }
        }
      },

      series: [{
        type: 'pie',
        data: data.map(x => ({
          name: x.rating,
          y: x.percentage
        }))
      }]

    };

  }

  loadTopSuppliers(data: any[]) {

    this.top10Year = data.map((x: any) => ({
      name: x.supplierName,
      score: x.score
    }));

    this.top10YearOptions = {

      chart: {
        type: 'column',
        height: 400
      },

      title: {
        text: ''
      },

      credits: {
        enabled: false
      },

      xAxis: {

        categories: data.map(x => x.supplierName)

      },

      yAxis: {

        title: {
          text: 'Score (%)'
        },

        max: 100

      },

      legend: {
        enabled: false
      },

      series: [{

        type: 'column',

        name: 'Score',

        data: data.map(x => x.score)

      }]

    };

  }

  loadBottomSuppliers(data: any[]) {

    this.bottom10Year = data.map((x: any) => ({
      name: x.supplierName,
      score: x.score
    }));

    this.bottom10YearOptions = {

      chart: {
        type: 'column',
        height: 400
      },

      title: {
        text: ''
      },

      credits: {
        enabled: false
      },

      xAxis: {

        categories: data.map(x => x.supplierName)

      },

      yAxis: {

        title: {
          text: 'Score (%)'
        },

        max: 100

      },

      legend: {
        enabled: false
      },

      series: [{

        type: 'column',

        name: 'Score',

        data: data.map(x => x.score)

      }]

    };

  }

  loadTopSuppliersLast3Years(data: any[]) {

    this.top10LastYears = data.map((x: any) => ({
      name: x.supplierName,
      score: x.score
    }));

    this.top10LastYearsOptions = {

      chart: {
        type: 'column',
        height: 400
      },

      title: {
        text: ''
      },

      credits: {
        enabled: false
      },

      xAxis: {
        categories: data.map(x => x.supplierName)
      },

      yAxis: {
        title: {
          text: 'Score (%)'
        },
        max: 100
      },

      legend: {
        enabled: false
      },

      series: [{
        type: 'column',
        name: 'Score',
        data: data.map(x => x.score)
      }]
    };

  }

  loadBottomSuppliersLast3Years(data: any[]) {

    this.bottom10LastYears = data.map((x: any) => ({
      name: x.supplierName,
      score: x.score
    }));

    this.bottom10LastYearsOptions = {

      chart: {
        type: 'column',
        height: 400
      },

      title: {
        text: ''
      },

      credits: {
        enabled: false
      },

      xAxis: {
        categories: data.map(x => x.supplierName)
      },

      yAxis: {
        title: {
          text: 'Score (%)'
        },
        max: 100
      },

      legend: {
        enabled: false
      },

      series: [{
        type: 'column',
        name: 'Score',
        data: data.map(x => x.score)
      }]
    };

  }
  // Distribution by Performance table data
  ratingList = [
    { rating: 'Excellent', percentage: '95%' },
    { rating: 'Good', percentage: '75%' },
    { rating: 'Average', percentage: '65%' },
    { rating: 'Poor', percentage: '45%' },
  ];

  // Top 10 Suppliers – current year
  top10Year = [
    { name: 'Supplier A', score: '92%' },
    { name: 'Supplier B', score: '87%' },
    { name: 'Supplier C', score: '78%' },
    { name: 'Supplier D', score: '85%' },
    { name: 'Supplier E', score: '90%' },
    { name: 'Supplier F', score: '76%' },
    { name: 'Supplier G', score: '80%' },
    { name: 'Supplier H', score: '88%' },
    { name: 'Supplier I', score: '90%' },
    { name: 'Supplier J', score: '82%' },
  ];

  // Bottom 10 Suppliers – current year
  bottom10Year = [
    { name: 'Supplier A', score: '92%' },
    { name: 'Supplier B', score: '87%' },
    { name: 'Supplier C', score: '78%' },
    { name: 'Supplier D', score: '84%' },
    { name: 'Supplier E', score: '90%' },
    { name: 'Supplier F', score: '76%' },
    { name: 'Supplier G', score: '80%' },
    { name: 'Supplier H', score: '88%' },
    { name: 'Supplier I', score: '90%' },
    { name: 'Supplier J', score: '82%' },
  ];

  // Top 10 Suppliers – last 3 years
  top10LastYears: any[] = [];
  // Bottom 10 Suppliers – last 3 years

  bottom10LastYears: any[] = [];

  private supplierCategories = [
    'Supplier 1', 'Supplier 2', 'Supplier 3', 'Supplier 4', 'Supplier 5',
    'Supplier 6', 'Supplier 7', 'Supplier 8', 'Supplier 9', 'Supplier 10',
    'Correl. Score'
  ];

  // ── Charts ──────────────────────────────────────────────────────────────

  performancePieOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 400                         // ← added
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
    series: [{
      type: 'pie',
      data: [
        { name: 'Excellent', y: 26.6, color: '#e74c3c' },
        { name: 'Good', y: 40.8, color: '#27ae60' },
        { name: 'Average', y: 21.2, color: '#f39c12' },
        { name: 'Poor', y: 11.4, color: '#3498db' }
      ]
    }]
  };

  top10YearOptions: Highcharts.Options = this.buildBarOptions(
    [14, 3, 1, 7, 3, 15, 3, 3, 4, 7, 8]
  );

  bottom10YearOptions: Highcharts.Options = this.buildBarOptions(
    [13, 2, 1, 7, 3, 15, 3, 2, 4, 7, 7]
  );

  top10LastYearsOptions: Highcharts.Options = this.buildBarOptions([]);

  bottom10LastYearsOptions: Highcharts.Options = this.buildBarOptions([]);

  private buildBarOptions(data: number[]): Highcharts.Options {
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 400                       // ← added
      },
      title: { text: '' },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        categories: this.supplierCategories,
        labels: { rotation: -25, style: { fontSize: '11px' } }
      },
      yAxis: {
        min: 0,
        max: 20,
        title: { text: '' },
        gridLineColor: '#e0e0e0'
      },
      legend: { enabled: true },
      plotOptions: {
        column: {
          colorByPoint: true,
          borderWidth: 0
        }
      },
      series: [{
        type: 'column',
        name: 'Score',
        data
      }]
    };
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}