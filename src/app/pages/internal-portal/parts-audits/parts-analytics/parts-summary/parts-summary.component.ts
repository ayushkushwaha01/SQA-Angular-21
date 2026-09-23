import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { AlertService } from 'src/app/shared/alert.service';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { PartAuditService } from '../../part-audit.service';

@Component({
  standalone: false,
  selector: 'app-parts-summary',
  templateUrl: './parts-summary.component.html',
  styleUrls: ['./parts-summary.component.scss']
})
export class PartsSummaryComponent implements OnInit {

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
    this.getAuditors();
    this.getSummary();
  }
  getSummary() {

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

    this.PartsAuditAnalayticsService.getCapaDashboardSummary(filter)
      .subscribe((res: any) => {

        if (res.success) {

          this.bindDashboard(res.data);

        }

      });

  }
  // months = [
  //   { name: 'January', value: 1 },
  //   { name: 'February', value: 2 },
  //   { name: 'March', value: 3 },
  //   { name: 'April', value: 4 },
  //   { name: 'May', value: 5 },
  //   { name: 'June', value: 6 },
  //   { name: 'July', value: 7 },
  //   { name: 'August', value: 8 },
  //   { name: 'September', value: 9 },
  //   { name: 'October', value: 10 },
  //   { name: 'November', value: 11 },
  //   { name: 'December', value: 12 }
  // ];

  // years: number[] = [2023, 2024, 2025, 2026];


  // forminit() {
  //   this.filterForm = this.fb.group({
  //     auditorId: [null],
  //     year: [null],
  //     month: [null]
  //   });
  // }

   months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];

  years: number[] = [2023, 2024, 2025, 2026];


  forminit() {
    const currentDate = new Date();
    this.filterForm = this.fb.group({
      auditorId: [null],
      year: [currentDate.getFullYear()],
      month: [currentDate.getMonth() + 1]
    });
  }


  onClearFilter() {
    this.filterForm.reset({
      auditorId: null,
      year: null,
      month: null
    });
    this.getSummary();


  }

  bindDashboard(data: any) {

    this.tableData = {
      totalParameters: data.totalParameters,
      checked: data.checked,
      nc: data.nc,
      safety: data.safety,
      critical: data.critical,
      important: data.important,
      fitment: data.fitment,
      regular: data.regular
    };

    this.loadDistributionChart(data.distributionByClass);

    this.loadIssuesChart(data.issuesCorrected);

    this.loadPdcaChart(data.pdcaDistribution);

  }

  loadDistributionChart(data: any) {

    this.distributionByClassOptions = {

      ...this.distributionByClassOptions,

      series: [{

        type: 'pie',

        data: [

          {
            name: 'Safety',
            y: data.safety,
            color: '#3498db'
          },

          {
            name: 'Critical',
            y: data.critical,
            color: '#e74c3c'
          },

          {
            name: 'Important',
            y: data.important,
            color: '#f39c12'
          },

          {
            name: 'Fitment',
            y: data.fitment,
            color: '#2ecc71'
          },

          {
            name: 'Regular',
            y: data.regular,
            color: '#9b59b6'
          }

        ]

      }]

    };

  }
  loadIssuesChart(data: any) {

    this.issuesCorrectedOptions = {

      ...this.issuesCorrectedOptions,

      series: [{

        type: 'pie',

        data: [

          {
            name: 'Corrected',
            y: data.corrected,
            color: '#87CEEB'
          },

          {
            name: 'Pending',
            y: data.pending,
            color: '#27ae60'
          },

          {
            name: 'Overdue',
            y: data.overdue,
            color: '#e74c3c'
          }

        ]

      }]

    };

  }

  loadPdcaChart(data: any) {

    this.pdcaDistributionOptions = {

      ...this.pdcaDistributionOptions,

      series: [{

        type: 'pie',

        data: [

          {
            name: 'Plan',
            y: data.plan,
            color: '#3498db'
          },

          {
            name: 'Do',
            y: data.do,
            color: '#f39c12'
          },

          {
            name: 'Check',
            y: data.check,
            color: '#9b59b6'
          },

          {
            name: 'Act',
            y: data.act,
            color: '#2ecc71'
          }

        ]

      }]

    };

  }


  Auditors: any[] = [];

  getAuditors() {
    this.PartAuditService.getAuditorDD()
      .subscribe((res: any) => {
        if (res.success) {
          this.Auditors = res.data;
          //this.Auditors = res.data.data.filter((user: any) => user.isAuditor === true);
        }
      });
  }



  tableData = {
    totalParameters: 0,
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
      size: '80%', // Locks the pie size so it doesn't shrink
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
        distance: 15 // Brings labels slightly closer to the pie to prevent clipping
      },
      showInLegend: false
    }
  };

  // Chart 1: Distribution by Class
  distributionByClassOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'Distribution by Class' },
    credits: { enabled: false },
    tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
    plotOptions: this.piePlotOptions,
    series: [{
      type: 'pie',
      name: 'Percentage',
      data: [
        { name: 'Regular', y: 50, color: '#27ae60' },     // Green
        { name: 'Important', y: 30, color: '#f39c12' },   // Orange
        { name: 'Critical', y: 20, color: '#e74c3c' }     // Red
      ]
    }]
  };

  // Chart 2: Issues Corrected
  issuesCorrectedOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'Issues Corrected' },
    credits: { enabled: false },
    tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
    plotOptions: this.piePlotOptions,
    series: [{
      type: 'pie',
      name: 'Percentage',
      data: [
        { name: 'Corrected', y: 11, color: '#87CEEB' },
        { name: 'Pending', y: 77, color: '#27ae60' },
        { name: 'Overdue', y: 11, color: '#e74c3c' }
      ]
    }]
  };

  // Chart 3: PDCA Distribution
  pdcaDistributionOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'PDCA Distribution' },
    credits: { enabled: false },
    tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
    plotOptions: this.piePlotOptions,
    series: [{
      type: 'pie',
      name: 'Percentage',
      data: [
        { name: 'Plan', y: 25, color: '#3498db' },   // Blue
        { name: 'Do', y: 35, color: '#e67e22' },     // Orange
        { name: 'Check', y: 20, color: '#9b59b6' },  // Purple
        { name: 'Act', y: 20, color: '#2ecc71' }     // Green
      ]
    }]
  };


}