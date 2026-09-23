import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-parts-fasteners',
  templateUrl: './parts-fasteners.component.html',
  styleUrls: ['./parts-fasteners.component.scss']
})
export class PartsFastenersComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1: Fasteners Specific Parts
  // Math adds up exactly to the Fasteners row from the 'All' tab
  fastenersList = [
    { name: 'Bolts', rating5: 35, rating4: 5, rating3: 1, rating2: 0, rating1: 0, ratingNA: 0 },
    { name: 'Nuts', rating5: 25, rating4: 3, rating3: 1, rating2: 0, rating1: 0, ratingNA: 0 },
    { name: 'Washers', rating5: 10, rating4: 1, rating3: 0, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Screws', rating5: 10, rating4: 1, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 }
  ];

  // Table Data 2: Distribution by Severity Percentages
  // Calculated based on the provided y-values (Total = 190)
  severityList = [
    { rating: 'Excellent', percent: '15.8%' }, 
    { rating: 'Good', percent: '26.3%' },      
    { rating: 'Satisfied', percent: '10.5%' }, 
    { rating: 'Major', percent: '26.3%' },
    { rating: 'Critical', percent: '10.5%' },
    { rating: 'NA', percent: '10.5%' }
  ];

  // Chart Options (Total Audits per Fastener Part)
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
        { name: 'Bolts', y: 41 },      
        { name: 'Nuts', y: 29 },      
        { name: 'Washers', y: 12 },    
        { name: 'Screws', y: 11 }  
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