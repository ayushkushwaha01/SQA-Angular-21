import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-parts-machining',
  templateUrl: './parts-marchining.component.html',
  styleUrls: ['./parts-marchining.component.scss']
})
export class PartsMarchiningComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1: Machining Specific Parts
  // Math adds up exactly to the Machining row from the 'All' tab
  machiningList = [
    { name: 'Gear Housing', rating5: 20, rating4: 5, rating3: 2, rating2: 1, rating1: 0, ratingNA: 1 },
    { name: 'Drive Shaft', rating5: 15, rating4: 5, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Valve Body', rating5: 10, rating4: 3, rating3: 1, rating2: 0, rating1: 0, ratingNA: 0 },
    { name: 'Piston', rating5: 10, rating4: 2, rating3: 1, rating2: 0, rating1: 0, ratingNA: 0 }
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

  // Chart Options (Total Audits per Machined Part)
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
        { name: 'Gear Housing', y: 29 },      
        { name: 'Drive Shaft', y: 22 },      
        { name: 'Valve Body', y: 14 },    
        { name: 'Piston', y: 13 }  
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