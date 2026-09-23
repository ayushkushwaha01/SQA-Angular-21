import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-parts-proprietary',
  templateUrl: './parts-proprietary.component.html',
  styleUrls: ['./parts-proprietary.component.scss']
})
export class PartsProprietaryComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1: Proprietary Specific Parts
  // Math adds up exactly to the Proprietary row from the 'All' tab
  proprietaryList = [
    { name: 'Engine Control Unit (ECU)', rating5: 25, rating4: 2, rating3: 1, rating2: 0, rating1: 0, ratingNA: 2 },
    { name: 'Infotainment System', rating5: 15, rating4: 2, rating3: 1, rating2: 0, rating1: 0, ratingNA: 2 },
    { name: 'Specialized Sensors', rating5: 15, rating4: 1, rating3: 0, rating2: 0, rating1: 0, ratingNA: 1 },
    { name: 'Patented Actuators', rating5: 5, rating4: 0, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 }
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

  // Chart Options (Total Audits per Proprietary Part)
  proprietaryPieOptions: Highcharts.Options = {
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
        { name: 'Engine Control Unit (ECU)', y: 30 },      
        { name: 'Infotainment System', y: 20 },      
        { name: 'Specialized Sensors', y: 17 },    
        { name: 'Patented Actuators', y: 5 }  
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