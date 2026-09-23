import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { PartsAuditAnalayticsService } from '../parts-audit-analaytics.service';

@Component({
  standalone: false,
  selector: 'app-analytics-commodity',
  templateUrl: './analytics-commodity.component.html',
  styleUrls: ['./analytics-commodity.component.scss']
})
export class AnalyticsCommodityComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  
  public updateChart: boolean = false;
  public selectedYear: number | null = null;
  public years: number[] = [2022, 2023, 2024, 2025, 2026, 2027];

  public commodityList: any[] = [];
  public totals = { rating5: 0, rating4: 0, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 };

  // This is kept static as requested
  public statusList = [
    { rating: '5 - Excellent', percent: '55.2%' }, 
    { rating: '4 - Good', percent: '20.7%' },      
    { rating: '3 - Satisfactory', percent: '10.3%' }, 
    { rating: '2 - Major', percent: '10.3%' },     
    { rating: '1 - Critical', percent: '3.5%' },  
    { rating: 'NA', percent: '0.0%' } 
  ];

  public commodityPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'Roboto, sans-serif' } },
    title: { text: '' },
    credits: { enabled: false },
    tooltip: {
      headerFormat: '',
      pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b>: <b>{point.percentage:.1f}%</b> ({point.y})',
      style: { fontSize: '13px' }
    },
    plotOptions: {
      pie: {
        innerSize: '58%',
        borderWidth: 2,
        borderColor: '#ffffff',
        dataLabels: {
          enabled: true,
          distance: 16,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: { fontSize: '12px', fontWeight: '500', color: '#374151', textOutline: 'none' }
        },
        showInLegend: true
      }
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'],
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemStyle: { color: '#4b5563', fontWeight: '500', fontSize: '12px' }
    },
    series: [{ type: 'pie', data: [] }]
  };

  public statusPieOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'Roboto, sans-serif' } },
    title: { text: '' },
    credits: { enabled: false },
    tooltip: {
      headerFormat: '',
      pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b>: <b>{point.percentage:.1f}%</b> ({point.y})',
      style: { fontSize: '13px' }
    },
    plotOptions: {
      pie: {
        innerSize: '58%',
        borderWidth: 2,
        borderColor: '#ffffff',
        dataLabels: {
          enabled: true,
          distance: 16,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: { fontSize: '12px', fontWeight: '500', color: '#374151', textOutline: 'none' }
        },
        showInLegend: true
      }
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemStyle: { color: '#4b5563', fontWeight: '500', fontSize: '12px' }
    },
    series: [{ type: 'pie', data: [] }]
  };

  constructor(private api: PartsAuditAnalayticsService) { }

  ngOnInit(): void {
    this.loadData();
  }

  public clearFilter() {
    this.selectedYear = null;
    this.loadData();
  }

  public loadData() {
    const filter = this.selectedYear ? { year: this.selectedYear } : {};
    
    this.api.getCommodityRatingDistribution(filter).subscribe({
      next: (res: any) => {
        // 🔥 NOW IT ONLY USES THE REAL DATABASE!
        if (res && res.success && res.data) {
          this.commodityList = res.data;
        } else {
          this.commodityList = []; // Shows "No records found" if empty
        }
        this.processData();
      },
      error: (err) => {
        console.error("API Error: ", err);
        this.commodityList = []; // Shows "No records found" if error
        this.processData();
      }
    });
  }

  private processData() {
    this.calculateTotals();
    this.updatePieCharts();
  }

  private calculateTotals() {
    this.totals = { rating5: 0, rating4: 0, rating3: 0, rating2: 0, rating1: 0, ratingNA: 0 };
    
    this.commodityList.forEach(item => {
      this.totals.rating5 += Number(item.rating5 || 0);
      this.totals.rating4 += Number(item.rating4 || 0);
      this.totals.rating3 += Number(item.rating3 || 0);
      this.totals.rating2 += Number(item.rating2 || 0);
      this.totals.rating1 += Number(item.rating1 || 0);
      this.totals.ratingNA += Number(item.ratingNA || 0);
    });

    const totalRatings = this.totals.rating5 + this.totals.rating4 + this.totals.rating3 + this.totals.rating2 + this.totals.rating1 + this.totals.ratingNA;

    this.statusList = [
      { rating: '5 - Excellent', percent: totalRatings ? ((this.totals.rating5 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '4 - Good', percent: totalRatings ? ((this.totals.rating4 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '3 - Satisfactory', percent: totalRatings ? ((this.totals.rating3 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '2 - Major', percent: totalRatings ? ((this.totals.rating2 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: '1 - Critical', percent: totalRatings ? ((this.totals.rating1 / totalRatings) * 100).toFixed(1) + '%' : '0.0%' },
      { rating: 'NA', percent: totalRatings ? ((this.totals.ratingNA / totalRatings) * 100).toFixed(1) + '%' : '0.0%' }
    ];
  }

  private updatePieCharts() {
    // Map the actual data to the Pie Chart
    const chartData = this.commodityList.map(item => {
      // Matches the C# exact output property names!
      return {
        name: item.commodityName, 
        y: Number(item.total)
      };
    });

    this.commodityPieOptions.series = [{ 
      type: 'pie', 
      data: chartData 
    }];

    // Update status pie chart dynamically based on real totals
    this.statusPieOptions.series = [{
      type: 'pie',
      data: [
        { name: '5 - Excellent', y: this.totals.rating5, color: '#4c9a2a' },
        { name: '4 - Good', y: this.totals.rating4, color: '#3b82f6' },
        { name: '3 - Satisfactory', y: this.totals.rating3, color: '#fcd34d' },
        { name: '2 - Major', y: this.totals.rating2, color: '#f8a000' },
        { name: '1 - Critical', y: this.totals.rating1, color: '#dc2626' },
        { name: 'NA', y: this.totals.ratingNA, color: '#9ca3af' }
      ]
    }];

    this.updateChart = false;
    setTimeout(() => {
      this.updateChart = true;
    }, 0);
  }
}