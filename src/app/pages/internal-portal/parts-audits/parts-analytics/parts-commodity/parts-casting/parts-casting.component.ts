import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-parts-casting',
  templateUrl: './parts-casting.component.html',
  styleUrls: ['./parts-casting.component.scss']
})
export class PartsCastingComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1: Casting Specific Parts
  castingList = [
    { name: 'Engine Block', rating5: 15, rating4: 5, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Cylinder Head', rating5: 10, rating4: 8, rating3: 3, rating2: 1, rating1: 1, ratingNA: 0 },
    { name: 'Brake Caliper', rating5: 12, rating4: 4, rating3: 2, rating2: 2, rating1: 0, ratingNA: 0 },
    { name: 'Transmission Case', rating5: 8, rating4: 3, rating3: 3, rating2: 1, rating1: 1, ratingNA: 0 }
  ];

  // Table Data 2: Casting Defect Severity
  severityList = [
  { rating: 'Excellent', percent: '26.7%' },
  { rating: 'Good', percent: '33.3%' },
  { rating: 'Satisfied', percent: '20.0%' },
  { rating: 'Major', percent: '10.0%' },
  { rating: 'Critical', percent: '6.7%' },
  { rating: 'NA', percent: '3.3%' }
];

  // Chart Options (Total Audits per Casting Part)
  castingPieOptions: Highcharts.Options = {
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
        { name: 'Engine Block', y: 23 },      
        { name: 'Cylinder Head', y: 23 },      
        { name: 'Brake Caliper', y: 20 },    
        { name: 'Transmission Case', y: 16 }  
      ]
    }]
  };

  // Status Chart Options (Severity Colors)
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