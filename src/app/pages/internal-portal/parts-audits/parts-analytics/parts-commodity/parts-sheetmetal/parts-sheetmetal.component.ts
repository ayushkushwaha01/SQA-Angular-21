import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-parts-sheetmetal',
  templateUrl: './parts-sheetmetal.component.html',
  styleUrls: ['./parts-sheetmetal.component.scss']
})
export class PartsSheetmetalComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1: Sheet Metal Specific Parts
  // Math adds up exactly to the Sheet Metal row from the 'All' tab
  sheetMetalList = [
    { name: 'Body Panels', rating5: 15, rating4: 6, rating3: 3, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Brackets', rating5: 12, rating4: 5, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Heat Shields', rating5: 9, rating4: 4, rating3: 1, rating2: 0, rating1: 1, ratingNA: 0 },
    { name: 'Enclosures', rating5: 6, rating4: 3, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 }
  ];

  // Table Data 2: Distribution by Severity Percentages
  // Standardized based on your exact requirements
  severityList = [
    { rating: 'Excellent', percent: '15.8%' }, 
    { rating: 'Good', percent: '26.3%' },      
    { rating: 'Satisfied', percent: '10.5%' }, 
    { rating: 'Major', percent: '26.3%' },
    { rating: 'Critical', percent: '10.5%' },
    { rating: 'NA', percent: '10.5%' }
  ];

  // Chart Options (Total Audits per Sheet Metal Part)
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
        { name: 'Body Panels', y: 25 },      
        { name: 'Brackets', y: 20 },      
        { name: 'Heat Shields', y: 15 },    
        { name: 'Enclosures', y: 11 }  
      ]
    }]
  };

  // Status Chart Options (Using requested exact names, values, and colors)
  severityPieOptions: Highcharts.Options = {
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