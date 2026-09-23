import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-parts-all',
  templateUrl: './parts-all.component.html',
  styleUrls: ['./parts-all.component.scss']
})
export class PartsAllComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1: Parts Audit Commodities
  commodityList = [
    { name: 'Casting', rating5: 45, rating4: 20, rating3: 10, rating2: 5, rating1: 2, ratingNA: 0 },
    { name: 'Forging', rating5: 38, rating4: 25, rating3: 8, rating2: 4, rating1: 1, ratingNA: 0 },
    { name: 'Machining', rating5: 55, rating4: 15, rating3: 5, rating2: 2, rating1: 0, ratingNA: 1 },
    { name: 'Fasteners', rating5: 80, rating4: 10, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Non-Metallic', rating5: 30, rating4: 15, rating3: 8, rating2: 2, rating1: 1, ratingNA: 2 },
    { name: 'Sheet Metal', rating5: 42, rating4: 18, rating3: 7, rating2: 3, rating1: 1, ratingNA: 0 },
    { name: 'Proprietary', rating5: 60, rating4: 5, rating3: 2, rating2: 0, rating1: 0, ratingNA: 5 }
  ];

  // Table Data 2: Distribution by Severity Percentages
  // Calculated based on the provided y-values (Total = 190)
  statusList = [
    { rating: 'Excellent', percent: '15.8%' }, 
    { rating: 'Good', percent: '26.3%' },      
    { rating: 'Satisfied', percent: '10.5%' }, 
    { rating: 'Major', percent: '26.3%' },
    { rating: 'Critical', percent: '10.5%' },
    { rating: 'NA', percent: '10.5%' }
  ];

  // Commodity Chart Options
  commodityPieOptions: Highcharts.Options = {
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
        { name: 'Casting', y: 82 },      
        { name: 'Forging', y: 76 },      
        { name: 'Machining', y: 78 },    
        { name: 'Fasteners', y: 93 },    
        { name: 'Non-Metallic', y: 58 }, 
        { name: 'Sheet Metal', y: 71 },
        { name: 'Proprietary', y: 72 }   
      ]
    }]
  };

  // Status Chart Options (Using requested exact names, values, and colors)
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
    { name: 'Excellent', y: 30, color: '#4c9a2a' }, // green
    { name: 'Good', y: 50, color: '#3b82f6' },      // blue
    { name: 'Satisfied', y: 20, color: '#fcd34d' }, // yellow
    { name: 'Major', y: 50, color: '#f8a000' },     // orange
    { name: 'Critical', y: 20, color: '#dc2626' },  // red
    { name: 'NA', y: 20, color: '#9ca3af' }         // gray
  ]
}]
  };

  constructor() { }

  ngOnInit(): void {
  }
}