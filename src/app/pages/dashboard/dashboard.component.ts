import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgApexchartsModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  @ViewChild('chart') chart!: ChartComponent;
  private router = inject(Router);

  projectList = ['PCMX', 'R2', 'M2', 'EHR', 'DX', 'R3'];
  selectedProject = 'PCMX';

  yearsList = [2023, 2024, 2025, 2026];
  selectedYear = 2025;

  weekList = Array.from({ length: 52 }, (_, i) => `Wk ${i + 1}`);
  selectedWeek = 'Wk 24';

  isLeaderboardView = false;

  // Apex Charts Options for Top Chart
  public barChartOptions: any;

  // Apex Charts Options for Bottom Heatmap
  public chartOptions: any;

  constructor() {
    this.initBarChart();
    this.initHeatmapChart();
  }

  initBarChart() {
    this.barChartOptions = {
      series: [
        {
          name: 'Compliant',
          data: [44, 55, 41, 67, 22, 43, 21, 49, 30, 45, 50, 60, 40, 50, 60, 70, 80, 60, 50, 40, 30, 50, 60, 70, 80, 90, 85, 75, 65, 55, 45, 35, 45, 55, 65, 75, 85, 95, 80, 70, 60, 50, 40, 50, 60, 70, 80, 75, 65, 55, 45, 60]
        },
        {
          name: 'Non-Compliant',
          data: [13, 23, 20, 8, 13, 27, 33, 12, 10, 15, 20, 10, 15, 20, 10, 15, 10, 20, 15, 10, 15, 20, 10, 15, 10, 5, 10, 15, 20, 15, 10, 15, 20, 10, 15, 10, 5, 2, 10, 15, 20, 15, 10, 15, 20, 10, 15, 10, 15, 20, 15, 10]
        }
      ],
      chart: {
        type: 'bar',
        height: 250,
        stacked: true,
        toolbar: {
          show: false
        }
      },
      colors: ['#28a745', '#dc3545'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.weekList,
        labels: {
          rotate: -45,
          style: {
            fontSize: '10px'
          }
        }
      }
    };
  }

  initHeatmapChart() {
    this.chartOptions = {
      series: [
        { name: 'Supplier A', data: this.generateData(10, { min: 0, max: 90 }) },
        { name: 'Supplier B', data: this.generateData(10, { min: 0, max: 90 }) },
        { name: 'Supplier C', data: this.generateData(10, { min: 0, max: 90 }) },
        { name: 'Supplier D', data: this.generateData(10, { min: 0, max: 90 }) },
        { name: 'Supplier E', data: this.generateData(10, { min: 0, max: 90 }) }
      ],
      chart: {
        height: 250,
        type: 'heatmap',
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        heatmap: {
          colorScale: {
            ranges: [
              { from: 0, to: 50, color: '#dc3545', name: 'Low' },
              { from: 51, to: 75, color: '#ffc107', name: 'Medium' },
              { from: 76, to: 100, color: '#28a745', name: 'High' }
            ]
          }
        }
      },
      stroke: {
        width: 1
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}% Compliance`
        }
      }
    };
  }

  generateData(count: number, yrange: { min: number; max: number }) {
    let i = 0;
    const series = [];
    while (i < count) {
      const x = `Wk ${i + 1}`;
      const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      series.push({ x, y });
      i++;
    }
    return series;
  }

  filterData() {
    // Reload charts or filter
  }

  goToFirstPage() { }
  prevPage() { }
  nextPage() { }
  goToLastPage() { }
}