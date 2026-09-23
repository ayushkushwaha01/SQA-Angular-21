import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts'; 

@Component({
  standalone: false,
  selector: 'app-process-sheetmetal',
  templateUrl: './process-sheetmetal.component.html',
  styleUrls: ['./process-sheetmetal.component.scss']
})
export class ProcessSheetmetalComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1 (Sheet Metal Sub-Categories summing up to the Sheet Metal totals from the ALL tab)
  sheetMetalList = [
    { name: 'Stamping', rating5: 3, rating4: 3, rating3: 2, rating2: 1, rating1: 1, ratingNA: 0 },
    { name: 'Bending & Forming', rating5: 3, rating4: 2, rating3: 2, rating2: 1, rating1: 1, ratingNA: 0 },
    { name: 'Laser Cutting', rating5: 2, rating4: 2, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Welding & Assembly', rating5: 1, rating4: 1, rating3: 1, rating2: 0, rating1: 0, ratingNA: 1 }
  ];

  // Table Data 2 (Calculated percentages based on the 30 total sheet metal audits)
  statusList = [
    { rating: 'Excellent', percent: '30.0%' }, // 9 out of 30
    { rating: 'Good', percent: '26.7%' },      // 8 out of 30
    { rating: 'Satisfied', percent: '23.3%' }, // 7 out of 30
    { rating: 'Major', percent: '10.0%' },     // 3 out of 30
    { rating: 'Critical', percent: '6.7%' },   // 2 out of 30
    { rating: 'NA', percent: '3.3%' },         // 1 out of 30
  ];

  // Sheet Metal Sub-Category Chart Options
  sheetMetalPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        size: '75%', 
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.percentage:.1f}%' },
        showInLegend: false
      }
    },
    series: [{
      type: 'pie',
      data: [
        { name: 'Stamping', y: 10 },          // 3+3+2+1+1+0
        { name: 'Bending & Forming', y: 9 },  // 3+2+2+1+1+0
        { name: 'Laser Cutting', y: 7 },      // 2+2+2+1+0+0
        { name: 'Welding & Assembly', y: 4 }  // 1+1+1+0+0+1
      ]
    }]
  };

  // Severity Chart Options for Sheet Metal
  statusPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        size: '75%', 
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.percentage:.1f}%' },
        showInLegend: false
      }
    },
    series: [{
  type: 'pie',
  data: [
    { name: 'Excellent', y: 9, color: '#4c9a2a' }, // green
    { name: 'Good', y: 8, color: '#3b82f6' },      // blue
    { name: 'Satisfied', y: 7, color: '#fcd34d' }, // yellow
    { name: 'Major', y: 3, color: '#f8a000' },     // orange
    { name: 'Critical', y: 2, color: '#dc2626' },  // red
    { name: 'NA', y: 1, color: '#9ca3af' }         // gray
  ]
}]
  };

  constructor() { }

  ngOnInit(): void {
  }
}