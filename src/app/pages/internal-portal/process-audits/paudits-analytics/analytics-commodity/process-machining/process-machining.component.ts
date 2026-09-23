import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts'; 

@Component({
  standalone: false,
  selector: 'app-process-machining',
  templateUrl: './process-machining.component.html',
  styleUrls: ['./process-machining.component.scss']
})
export class ProcessMachiningComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1 (6 Machining Sub-Categories summing up to the Machining totals from the ALL tab)
  machiningList = [
    { name: 'Turning', rating5: 4, rating4: 2, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Milling', rating5: 3, rating4: 2, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Drilling', rating5: 3, rating4: 2, rating3: 1, rating2: 0, rating1: 0, ratingNA: 0 },
    { name: 'Grinding', rating5: 2, rating4: 1, rating3: 1, rating2: 0, rating1: 0, ratingNA: 0 },
    { name: 'Boring', rating5: 2, rating4: 1, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 },
    { name: 'EDM', rating5: 1, rating4: 1, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 }
  ];

  // Table Data 2 (Calculated percentages based on the 30 total machining audits)
  statusList = [
    { rating: 'Excellent', percent: '50.0%' }, // 15 out of 30
    { rating: 'Good', percent: '30.0%' },      // 9 out of 30
    { rating: 'Satisfied', percent: '13.3%' }, // 4 out of 30
    { rating: 'Major', percent: '6.7%' },      // 2 out of 30
    { rating: 'Critical', percent: '0.0%' },   // 0 out of 30
    { rating: 'NA', percent: '0.0%' },         // 0 out of 30
  ];

  // Machining Sub-Category Chart Options
  machiningPieOptions: Highcharts.Options = {
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
        { name: 'Turning', y: 8 },  // 4+2+1+1+0+0
        { name: 'Milling', y: 7 },  // 3+2+1+1+0+0
        { name: 'Drilling', y: 6 }, // 3+2+1+0+0+0
        { name: 'Grinding', y: 4 }, // 2+1+1+0+0+0
        { name: 'Boring', y: 3 },   // 2+1+0+0+0+0
        { name: 'EDM', y: 2 }       // 1+1+0+0+0+0
      ]
    }]
  };

  // Severity Chart Options for Machining
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
    { name: 'Excellent', y: 15, color: '#4c9a2a' }, // green
    { name: 'Good', y: 9, color: '#3b82f6' },       // blue
    { name: 'Satisfied', y: 4, color: '#fcd34d' },  // yellow
    { name: 'Major', y: 2, color: '#f8a000' },      // orange
    { name: 'Critical', y: 0, color: '#dc2626' },   // red
    { name: 'NA', y: 0, color: '#9ca3af' }          // gray
  ]
}]
  };

  constructor() { }

  ngOnInit(): void {
  }
}