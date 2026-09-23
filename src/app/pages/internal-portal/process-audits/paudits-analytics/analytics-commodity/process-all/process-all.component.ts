import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts'; 

@Component({
  standalone: false,
  selector: 'app-process-all',
  templateUrl: './process-all.component.html',
  styleUrls: ['./process-all.component.scss']
})
export class ProcessAllComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; 
  selectedYear: any = 2025;
  years: any[] = [2022, 2023, 2024, 2025, 2026, 2027];
  updateFlag: boolean = false;

  // Base raw data set per year for filtering
  rawYearData: any = {
    '2025': {
      commodityList: [
        { name: 'Casting', rating5: 11, rating4: 3, rating3: 3, rating2: 2, rating1: 1, ratingNA: 0 },
        { name: 'Machining', rating5: 5, rating4: 0, rating3: 0, rating2: 1, rating1: 1, ratingNA: 0 },
        { name: 'Forging', rating5: 0, rating4: 0, rating3: 0, rating2: 1, rating1: 0, ratingNA: 0 }
      ],
      pieData: [
        { name: 'Casting', y: 71.4 },
        { name: 'Machining', y: 25.0 },
        { name: 'Forging', y: 3.6 }
      ]
    },
    '2024': {
      commodityList: [
        { name: 'Casting', rating5: 14, rating4: 6, rating3: 4, rating2: 1, rating1: 1, ratingNA: 0 },
        { name: 'Forging', rating5: 8, rating4: 5, rating3: 2, rating2: 1, rating1: 0, ratingNA: 1 },
        { name: 'Machining', rating5: 12, rating4: 7, rating3: 3, rating2: 2, rating1: 0, ratingNA: 0 },
        { name: 'Fasteners', rating5: 6, rating4: 4, rating3: 2, rating2: 1, rating1: 1, ratingNA: 0 }
      ],
      pieData: [
        { name: 'Casting', y: 38 },
        { name: 'Forging', y: 22 },
        { name: 'Machining', y: 28 },
        { name: 'Fasteners', y: 12 }
      ]
    },
    '2023': {
      commodityList: [
        { name: 'Casting', rating5: 8, rating4: 5, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
        { name: 'Machining', rating5: 10, rating4: 6, rating3: 3, rating2: 1, rating1: 0, ratingNA: 0 }
      ],
      pieData: [
        { name: 'Casting', y: 45 },
        { name: 'Machining', y: 55 }
      ]
    },
    '2026': {
      commodityList: [
        { name: 'Casting', rating5: 15, rating4: 10, rating3: 5, rating2: 2, rating1: 0, ratingNA: 0 },
        { name: 'Machining', rating5: 8, rating4: 4, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
        { name: 'Sheet Metal', rating5: 12, rating4: 6, rating3: 3, rating2: 1, rating1: 0, ratingNA: 0 }
      ],
      pieData: [
        { name: 'Casting', y: 50 },
        { name: 'Machining', y: 25 },
        { name: 'Sheet Metal', y: 25 }
      ]
    },
    '2022': {
      commodityList: [
        { name: 'Casting', rating5: 5, rating4: 3, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 }
      ],
      pieData: [
        { name: 'Casting', y: 100 }
      ]
    },
    '2027': {
      commodityList: [
        { name: 'Casting', rating5: 4, rating4: 2, rating3: 1, rating2: 0, rating1: 0, ratingNA: 0 }
      ],
      pieData: [
        { name: 'Casting', y: 100 }
      ]
    }
  };

  commodityList: any[] = [];
  totals = { rating5: 0, rating4: 0, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 };
  statusList: any[] = [];

  commodityPieOptions: Highcharts.Options = {};
  statusPieOptions: Highcharts.Options = {};

  constructor() { }

  ngOnInit(): void {
    this.applyYearFilter();
  }

  clearYearFilter(): void {
    this.selectedYear = null;
    this.applyYearFilter();
  }

  applyYearFilter(): void {
    const key = this.selectedYear ? String(this.selectedYear) : '2025';
    const data = this.rawYearData[key] || this.rawYearData['2025'];
    if (!data) return;

    this.commodityList = [...data.commodityList];

    // Calculate totals dynamically
    this.totals = this.commodityList.reduce((acc, curr) => {
      acc.rating5 += Number(curr.rating5 || 0);
      acc.rating4 += Number(curr.rating4 || 0);
      acc.rating3 += Number(curr.rating3 || 0);
      acc.rating2 += Number(curr.rating2 || 0);
      acc.rating1 += Number(curr.rating1 || 0);
      acc.ratingNA += Number(curr.ratingNA || 0);
      return acc;
    }, { rating5: 0, rating4: 0, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 });

    const totalRatings = this.totals.rating5 + this.totals.rating4 + this.totals.rating3 + this.totals.rating2 + this.totals.rating1 + this.totals.ratingNA;

    this.statusList = [
      { rating: '5 - Excellent', percent: totalRatings ? ((this.totals.rating5 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '4 - Good', percent: totalRatings ? ((this.totals.rating4 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '3 - Satisfactory', percent: totalRatings ? ((this.totals.rating3 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '2 - Major', percent: totalRatings ? ((this.totals.rating2 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '1 - Critical', percent: totalRatings ? ((this.totals.rating1 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: 'NA', percent: totalRatings ? ((this.totals.ratingNA / totalRatings) * 100).toFixed(1) + '%' : '0.0%' }
    ];

    // Update Commodity Pie Options
    this.commodityPieOptions = {
      chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'Roboto, sans-serif' } },
      title: { text: '' },
      credits: { enabled: false },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b>: <b>{point.percentage:.1f}%</b> ({point.y})',
        style: { fontSize: '13px' }
      },
      plotOptions: {
        pie: {
          innerSize: '58%',
          borderWidth: 2,
          borderColor: '#ffffff',
          dataLabels: {
            enabled: true,
            distance: 16,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            style: { fontSize: '12px', fontWeight: '500', color: '#374151', textOutline: 'none' }
          },
          showInLegend: true
        }
      },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'],
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: { color: '#4b5563', fontWeight: '500', fontSize: '12px' }
      },
      series: [{
        type: 'pie',
        name: 'Distribution',
        data: [...data.pieData]
      }]
    };

    // Update Status Pie Options
    this.statusPieOptions = {
      chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'Roboto, sans-serif' } },
      title: { text: '' },
      credits: { enabled: false },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b>: <b>{point.percentage:.1f}%</b> ({point.y})',
        style: { fontSize: '13px' }
      },
      plotOptions: {
        pie: {
          innerSize: '58%',
          borderWidth: 2,
          borderColor: '#ffffff',
          dataLabels: {
            enabled: true,
            distance: 16,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            style: { fontSize: '12px', fontWeight: '500', color: '#374151', textOutline: 'none' }
          },
          showInLegend: true
        }
      },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: { color: '#4b5563', fontWeight: '500', fontSize: '12px' }
      },
      series: [{
        type: 'pie',
        name: 'Severity',
        data: [
          { name: '5 - Excellent', y: this.totals.rating5, color: '#10b981' },
          { name: '4 - Good', y: this.totals.rating4, color: '#3b82f6' },
          { name: '3 - Satisfactory', y: this.totals.rating3, color: '#f59e0b' },
          { name: '2 - Major', y: this.totals.rating2, color: '#f97316' },
          { name: '1 - Critical', y: this.totals.rating1, color: '#ef4444' },
          { name: 'NA', y: this.totals.ratingNA, color: '#9ca3af' }
        ]
      }]
    };

    // Trigger Highcharts Angular chart re-rendering via async change detection cycle
    this.updateFlag = false;
    setTimeout(() => {
      this.updateFlag = true;
    }, 0);
  }
}