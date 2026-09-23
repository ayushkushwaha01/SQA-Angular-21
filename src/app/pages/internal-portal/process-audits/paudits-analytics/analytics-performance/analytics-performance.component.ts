import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-analytics-performance',
  templateUrl: './analytics-performance.component.html',
  styleUrls: ['./analytics-performance.component.scss']
})
export class AnalyticsPerformanceComponent {
  Highcharts: typeof Highcharts = Highcharts;

  clearFilter(): void {
    // Reset filters if form exists
  }

  // Distribution by Performance table data
  ratingList = [
    { rating: 'Excellent', percentage: '95%' },
    { rating: 'Good',      percentage: '75%' },
    { rating: 'Average',   percentage: '65%' },
    { rating: 'Poor',      percentage: '45%' },
  ];

  // Top 10 Suppliers – current year
  top10Year = [
    { name: 'Supplier A', score: '92%' },
    { name: 'Supplier B', score: '87%' },
    { name: 'Supplier C', score: '78%' },
    { name: 'Supplier D', score: '85%' },
    { name: 'Supplier E', score: '90%' },
    { name: 'Supplier F', score: '76%' },
    { name: 'Supplier G', score: '80%' },
    { name: 'Supplier H', score: '88%' },
    { name: 'Supplier I', score: '90%' },
    { name: 'Supplier J', score: '82%' },
  ];

  // Bottom 10 Suppliers – current year
  bottom10Year = [
    { name: 'Supplier A', score: '92%' },
    { name: 'Supplier B', score: '87%' },
    { name: 'Supplier C', score: '78%' },
    { name: 'Supplier D', score: '84%' },
    { name: 'Supplier E', score: '90%' },
    { name: 'Supplier F', score: '76%' },
    { name: 'Supplier G', score: '80%' },
    { name: 'Supplier H', score: '88%' },
    { name: 'Supplier I', score: '90%' },
    { name: 'Supplier J', score: '82%' },
  ];

  // Top 10 Suppliers – last 3 years
  top10LastYears = [
    { name: 'Supplier A', score: '92%' },
    { name: 'Supplier B', score: '87%' },
    { name: 'Supplier C', score: '78%' },
    { name: 'Supplier D', score: '85%' },
    { name: 'Supplier E', score: '90%' },
    { name: 'Supplier F', score: '76%' },
    { name: 'Supplier G', score: '80%' },
    { name: 'Supplier H', score: '88%' },
    { name: 'Supplier I', score: '90%' },
    { name: 'Supplier J', score: '82%' },
  ];

  // Bottom 10 Suppliers – last 3 years
  bottom10LastYears = [
    { name: 'Supplier A', score: '92%' },
    { name: 'Supplier B', score: '87%' },
    { name: 'Supplier C', score: '78%' },
    { name: 'Supplier D', score: '84%' },
    { name: 'Supplier E', score: '90%' },
    { name: 'Supplier F', score: '76%' },
    { name: 'Supplier G', score: '80%' },
    { name: 'Supplier H', score: '88%' },
    { name: 'Supplier I', score: '90%' },
    { name: 'Supplier J', score: '82%' },
  ];

  private supplierCategories = [
    'Supplier 1', 'Supplier 2', 'Supplier 3', 'Supplier 4', 'Supplier 5',
    'Supplier 6', 'Supplier 7', 'Supplier 8', 'Supplier 9', 'Supplier 10',
    'Correl. Score'
  ];

  // ── Charts ──────────────────────────────────────────────────────────────

  performancePieOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 400                         // ← added
    },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y:.1f}%'
        },
        showInLegend: false
      }
    },
    series: [{
      type: 'pie',
      data: [
        { name: 'Excellent', y: 26.6, color: '#e74c3c' },
        { name: 'Good',      y: 40.8, color: '#27ae60' },
        { name: 'Average',   y: 21.2, color: '#f39c12' },
        { name: 'Poor',      y: 11.4, color: '#3498db' }
      ]
    }]
  };

  top10YearOptions: Highcharts.Options = this.buildBarOptions(
    [14, 3, 1, 7, 3, 15, 3, 3, 4, 7, 8]
  );

  bottom10YearOptions: Highcharts.Options = this.buildBarOptions(
    [13, 2, 1, 7, 3, 15, 3, 2, 4, 7, 7]
  );

  top10LastYearsOptions: Highcharts.Options = this.buildBarOptions(
    [16, 3, 1, 7, 3, 16, 3, 3, 4, 7, 8]
  );

  bottom10LastYearsOptions: Highcharts.Options = this.buildBarOptions(
    [13, 3, 1, 6, 3, 15, 3, 2, 4, 6, 7]
  );

  private buildBarOptions(data: number[]): Highcharts.Options {
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 400                       // ← added
      },
      title: { text: '' },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        categories: this.supplierCategories,
        labels: { rotation: -25, style: { fontSize: '11px' } }
      },
      yAxis: {
        min: 0,
        max: 20,
        title: { text: '' },
        gridLineColor: '#e0e0e0'
      },
      legend: { enabled: true },
      plotOptions: {
        column: {
          colorByPoint: true,
          borderWidth: 0
        }
      },
      series: [{
        type: 'column',
        name: 'Score',
        data
      }]
    };
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}