import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts'; 

@Component({
  standalone: false,
  selector: 'app-process-forging',
  templateUrl: './process-forging.component.html',
  styleUrls: ['./process-forging.component.scss']
})
export class ProcessForgingComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1 (Forging Sub-Categories summing up to the Forging totals from the ALL tab)
  forgingList = [
    { name: 'Closed Die Forging', rating5: 4, rating4: 3, rating3: 2, rating2: 1, rating1: 0, ratingNA: 1 },
    { name: 'Open Die Forging', rating5: 3, rating4: 2, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Cold Forging', rating5: 3, rating4: 2, rating3: 2, rating2: 0, rating1: 1, ratingNA: 0 }
  ];

  // Table Data 2 (Calculated percentages based on the 27 total forging audits)
  statusList = [
    { rating: 'Excellent', percent: '37.0%' }, 
    { rating: 'Good', percent: '25.9%' },      
    { rating: 'Satisfied', percent: '22.2%' }, 
    { rating: 'Major', percent: '7.4%' },     
    { rating: 'Critical', percent: '3.7%' },  
    { rating: 'NA', percent: '3.7%' },        
  ];

  // Forging Sub-Category Chart Options
  forgingPieOptions: Highcharts.Options = {
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
        { name: 'Closed Die Forging', y: 11 }, // 4+3+2+1+0+1
        { name: 'Open Die Forging', y: 8 },    // 3+2+2+1+0+0
        { name: 'Cold Forging', y: 8 }         // 3+2+2+0+1+0
      ]
    }]
  };

  // Severity Chart Options for Forging
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
    { name: 'Excellent', y: 10, color: '#4c9a2a' }, // green
    { name: 'Good', y: 7, color: '#3b82f6' },       // blue
    { name: 'Satisfied', y: 6, color: '#fcd34d' },  // yellow
    { name: 'Major', y: 2, color: '#f8a000' },      // orange
    { name: 'Critical', y: 1, color: '#dc2626' },   // red
    { name: 'NA', y: 1, color: '#9ca3af' }          // gray
  ]
}]
  };

  constructor() { }

  ngOnInit(): void {
  }
}