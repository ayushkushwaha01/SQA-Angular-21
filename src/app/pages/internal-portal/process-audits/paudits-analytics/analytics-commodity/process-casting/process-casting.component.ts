import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts'; 

@Component({
  standalone: false,
  selector: 'app-process-casting',
  templateUrl: './process-casting.component.html',
  styleUrls: ['./process-casting.component.scss']
})
export class ProcessCastingComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1 (Casting Sub-Categories summing up to the Casting totals from the ALL tab)
  castingList = [
    { name: 'Sand Casting', rating5: 5, rating4: 3, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Die Casting', rating5: 4, rating4: 3, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Investment Casting', rating5: 3, rating4: 2, rating3: 2, rating2: 1, rating1: 1, ratingNA: 0 }
  ];

  // Table Data 2 (Calculated percentages based on the 29 total casting audits)
  statusList = [
    { rating: 'Excellent', percent: '41.4%' }, 
    { rating: 'Good', percent: '27.6%' },      
    { rating: 'Satisfied', percent: '17.2%' }, 
    { rating: 'Major', percent: '10.4%' },     
    { rating: 'Critical', percent: '3.4%' },  
    { rating: 'NA', percent: '0.0%' },        
  ];

  // Casting Sub-Category Chart Options
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
        { name: 'Sand Casting', y: 11 },       // 5+3+2+1+0+0
        { name: 'Die Casting', y: 9 },         // 4+3+1+1+0+0
        { name: 'Investment Casting', y: 9 }   // 3+2+2+1+1+0
      ]
    }]
  };

  // Severity Chart Options for Casting
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
    { name: 'Excellent', y: 12, color: '#4c9a2a' }, // green
    { name: 'Good', y: 8, color: '#3b82f6' },       // blue
    { name: 'Satisfied', y: 5, color: '#fcd34d' },  // yellow
    { name: 'Major', y: 3, color: '#f8a000' },      // orange
    { name: 'Critical', y: 1, color: '#dc2626' },   // red
    { name: 'NA', y: 0, color: '#9ca3af' }          // gray
  ]
}]
  };

  constructor() { }

  ngOnInit(): void {
  }
}