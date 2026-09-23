import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts'; 

@Component({
  standalone: false,
  selector: 'app-process-nonmetallic',
  templateUrl: './process-nonmetallic.component.html',
  styleUrls: ['./process-nonmetallic.component.scss']
})
export class ProcessNonmetallicComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; 

  // Table Data 1 (Non-Metallic Sub-Categories summing up to the Non-Metallic totals from the ALL tab)
  nonMetallicList = [
    { name: 'Injection Molding', rating5: 4, rating4: 3, rating3: 2, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Rubber & Elastomers', rating5: 3, rating4: 2, rating3: 1, rating2: 1, rating1: 1, ratingNA: 0 },
    { name: 'Composites', rating5: 3, rating4: 1, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 },
    { name: 'Ceramics & Glass', rating5: 1, rating4: 1, rating3: 1, rating2: 1, rating1: 0, ratingNA: 0 }
  ];

  // Table Data 2 (Calculated percentages based on the 28 total non-metallic audits)
  statusList = [
    { rating: 'Excellent', percent: '39.3%' }, // 11 out of 28
    { rating: 'Good', percent: '25.0%' },      // 7 out of 28
    { rating: 'Satisfied', percent: '17.9%' }, // 5 out of 28
    { rating: 'Major', percent: '14.3%' },     // 4 out of 28
    { rating: 'Critical', percent: '3.6%' },   // 1 out of 28
    { rating: 'NA', percent: '0.0%' },         // 0 out of 28
  ];

  // Non-Metallic Sub-Category Chart Options
  nonMetallicPieOptions: Highcharts.Options = {
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
        { name: 'Injection Molding', y: 10 },    // 4+3+2+1+0+0
        { name: 'Rubber & Elastomers', y: 8 },   // 3+2+1+1+1+0
        { name: 'Composites', y: 6 },            // 3+1+1+1+0+0
        { name: 'Ceramics & Glass', y: 4 }       // 1+1+1+1+0+0
      ]
    }]
  };

  // Severity Chart Options for Non-Metallic
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
    { name: 'Excellent', y: 11, color: '#4c9a2a' }, // green
    { name: 'Good', y: 7, color: '#3b82f6' },       // blue
    { name: 'Satisfied', y: 5, color: '#fcd34d' },  // yellow
    { name: 'Major', y: 4, color: '#f8a000' },      // orange
    { name: 'Critical', y: 1, color: '#dc2626' },   // red
    { name: 'NA', y: 0, color: '#9ca3af' }          // gray
  ]
}]
  };

  constructor() { }

  ngOnInit(): void {
  }
}