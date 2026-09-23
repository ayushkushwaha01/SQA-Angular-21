import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts'; 

@Component({
  standalone: false,
  selector: 'app-process-fasteners',
  templateUrl: './process-fasteners.component.html',
  styleUrls: ['./process-fasteners.component.scss']
})
export class ProcessFastenersComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1 (Fastener Sub-Categories summing up to the Fastener totals from the ALL tab)
  fastenersList = [
    { name: 'Bolts & Screws', rating5: 3, rating4: 3, rating3: 2, rating2: 1, rating1: 1, ratingNA: 0 },
    { name: 'Nuts', rating5: 2, rating4: 3, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Washers', rating5: 1, rating4: 2, rating3: 1, rating2: 0, rating1: 0, ratingNA: 1 },
    { name: 'Rivets', rating5: 1, rating4: 1, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Special Fasteners', rating5: 1, rating4: 1, rating3: 1, rating2: 0, rating1: 1, ratingNA: 0 }
  ];

  // Table Data 2 (Calculated percentages based on the 30 total fastener audits)
  statusList = [
    { rating: 'Excellent', percent: '26.7%' }, // 8 out of 30
    { rating: 'Good', percent: '33.3%' },      // 10 out of 30
    { rating: 'Satisfied', percent: '20.0%' }, // 6 out of 30
    { rating: 'Major', percent: '10.0%' },     // 3 out of 30
    { rating: 'Critical', percent: '6.7%' },   // 2 out of 30
    { rating: 'NA', percent: '3.3%' },         // 1 out of 30
  ];

  // Fasteners Sub-Category Chart Options
  fastenersPieOptions: Highcharts.Options = {
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
        { name: 'Bolts & Screws', y: 10 }, // 3+3+2+1+1+0
        { name: 'Nuts', y: 7 },            // 2+3+1+1+0+0
        { name: 'Washers', y: 5 },         // 1+2+1+0+0+1
        { name: 'Rivets', y: 4 },          // 1+1+1+1+0+0
        { name: 'Special Fasteners', y: 4 }// 1+1+1+0+1+0
      ]
    }]
  };

  // Severity Chart Options for Fasteners
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
    { name: 'Excellent', y: 8, color: '#4c9a2a' }, // green
    { name: 'Good', y: 10, color: '#3b82f6' },     // blue
    { name: 'Satisfied', y: 6, color: '#fcd34d' }, // yellow
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