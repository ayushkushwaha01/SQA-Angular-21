import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { AlertService } from 'src/app/shared/alert.service';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';
import { PartAuditService } from '../../part-audit.service';

@Component({
  standalone: false,
  selector: 'app-parts-pareto',
  templateUrl: './parts-pareto.component.html',
  styleUrls: ['./parts-pareto.component.scss']
})
export class PartsParetoComponent implements OnInit, AfterViewInit {

  Highcharts: typeof Highcharts = Highcharts;
  years: number[] = [2023, 2024, 2025, 2026];

  constructor(private dialog: MatDialog, private fb: FormBuilder,
    private alertService: AlertService, private api: CommodityService, private PartsAuditAnalayticsService: PartsAuditAnalayticsService,
    private PartAuditService: PartAuditService
  ) { }

  filterForm!: FormGroup;

  ngOnInit(): void {
    this.forminit();
    this.getCommodities();
    this.getPareto();
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
  getPareto() {

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

    this.PartsAuditAnalayticsService.getDashboardPareto(filter)
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            this.loadCritical(res.data.critical);

            this.loadImportant(res.data.important);

            this.loadCriticalImportant(res.data.criticalImportant);

          }

        }
      });

  }

  loadCritical(data: any[]) {

    this.pareto = data.map(x => ({
      name: x.categoryName,
      action: x.capa
    }));

    this.commodityPieOptions = {

      ...this.commodityPieOptions,

      series: [{
        type: 'pie',
        data: data.map(x => ({
          name: x.categoryName,
          y: x.capa
        }))
      }]

    };

  }

  loadImportant(data: any[]) {

    this.statusList = data.map(x => ({
      name: x.categoryName,
      action: x.capa
    }));

    this.statusPieOptions = {

      ...this.statusPieOptions,

      series: [{
        type: 'pie',
        data: data.map(x => ({
          name: x.categoryName,
          y: x.capa
        }))
      }]

    };

  }
  loadCriticalImportant(data: any[]) {

    this.criticalList = data.map(x => ({
      name: x.categoryName,
      action: x.capa
    }));

    this.criticalPieOptions = {

      ...this.criticalPieOptions,

      series: [{
        type: 'pie',
        data: data.map(x => ({
          name: x.categoryName,
          y: x.capa
        }))
      }]

    };

  }

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
    this.getPareto();

  }

  // Parts Audit Categories (Critical NCs)
  pareto = [
    { name: 'Dimensional Clock', action: '12' },
    { name: 'Surface Finish', action: '17' },
    { name: 'Performance', action: '15' },
    { name: 'Metallurgical', action: '8' },
    { name: 'Mechanical', action: '5' },
  ];

  // Parts Audit Categories (Important NCs)
  statusList = [
    { name: 'Dimensional Clock', action: '14' },
    { name: 'Surface Finish', action: '10' },
    { name: 'Performance', action: '19' },
    { name: 'Metallurgical', action: '6' },
    { name: 'Mechanical', action: '9' },
  ];

  // Commodities List
  criticalList = [
    { name: 'Casting', action: '22' },
    { name: 'Forging', action: '14' },
    { name: 'Machining', action: '18' },
    { name: 'Fasteners', action: '9' },
    { name: 'Sheet Metal', action: '11' },
  ];

  commodityPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y:.0f}%' },
        showInLegend: false
      }
    },
    series: [{
      type: 'pie',
      data: [
        { name: 'Dimensional', y: 21, color: '#87ceeb' },
        { name: 'Surface', y: 30, color: '#008000' },
        { name: 'Performance', y: 26, color: '#ff0000' },
        { name: 'Metallurgical', y: 14, color: '#ffff00' },
        { name: 'Mechanical', y: 9, color: '#0000ff' },
      ]
    }]
  };

  statusPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y:.0f}%' },
        showInLegend: false
      }
    },
    series: [{
      type: 'pie',
      data: [
        { name: 'Dimensional', y: 24, color: '#87ceeb' },
        { name: 'Surface', y: 17, color: '#008000' },
        { name: 'Performance', y: 32, color: '#ff0000' },
        { name: 'Metallurgical', y: 11, color: '#ffff00' },
        { name: 'Mechanical', y: 16, color: '#0000ff' },
      ]
    }]
  };

  criticalPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y:.0f}%' },
        showInLegend: false
      }
    },
    series: [{
      type: 'pie',
      data: [
        { name: 'Casting', y: 30, color: '#87ceeb' },
        { name: 'Forging', y: 19, color: '#008000' },
        { name: 'Machining', y: 24, color: '#ff0000' },
        { name: 'Fasteners', y: 12, color: '#ffff00' },
        { name: 'Sheet Metal', y: 15, color: '#0000ff' },
      ]
    }]
  };


  ngAfterViewInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }
}