import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { AlertService } from 'src/app/shared/alert.service';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';

@Component({
  standalone: false,
  selector: 'app-parts-scatter',
  templateUrl: './parts-scatter.component.html',
  styleUrls: ['./parts-scatter.component.scss']
})
export class PartsScatterComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private alertService: AlertService,
    private api: CommodityService,
    private PartsAuditAnalayticsService: PartsAuditAnalayticsService
  ) { }

  filterForm!: FormGroup;

  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];

  years: number[] = [2023, 2024, 2025, 2026];

  Highcharts: typeof Highcharts = Highcharts;

  // Give it a real skeleton instead of {} so the first render
  // already has valid chart/series config, not an empty object
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'scatter',
      backgroundColor: '#ffffff'
    },
    series: [{
      type: 'scatter',
      name: 'Score',
      color: '#b0c4de',
      data: []
    }]
  };

  ngOnInit(): void {
    this.forminit();
    this.onGoClick(); // initial load with no filters -> entire data
  }

  // forminit() {
  //   this.filterForm = this.fb.group({
  //     month: [null],
  //     year: [null]
  //   });
  // }

   forminit() {
    const currentDate = new Date();
    this.filterForm = this.fb.group({
      month: [currentDate.getMonth() + 1],
      year: [currentDate.getFullYear()]
    });
  }

  onClearFilter() {
    this.filterForm.reset({
      month: null,
      year: null
    });
    this.onGoClick();
  }

  onGoClick() {
    const filter = this.buildCleanFilter();
    this.getScatterChart(filter);
  }

  private buildCleanFilter(): any {
    const filter = { ...this.filterForm.value };
    Object.keys(filter).forEach(key => {
      if (
        filter[key] === null ||
        filter[key] === undefined ||
        filter[key] === '' ||
        filter[key] === 'null'
      ) {
        delete filter[key];
      }
    });
    return filter; // {} on first load, since month/year are both null
  }

  getScatterChart(filter: any) {
    this.PartsAuditAnalayticsService.getScatterChart(filter).subscribe({
      next: (res: any) => {

        if (res?.success) {

          const scatterData: [number, number][] =
            (res.data ?? []).map((item: any) =>
              [item.day, item.okayPercentage] as [number, number]
            );

          if (scatterData.length === 0) {
            this.initChart([]);   // Clear chart
            return;
          }

          this.initChart(scatterData);
          console.log('API Response:', res);
          console.log('Scatter Data:', scatterData);
        }

      },
      error: (err) => {
        this.alertService.createAlert(
          err.error?.message || 'Error fetching scatter chart data',
          0
        );
      }
    });
  }

  private getDaysInMonth(): number {
    const monthNumber = this.filterForm.value.month;
    const year = this.filterForm.value.year;

    // No filter selected -> default to 31 so the axis fits any day value returned
    if (!monthNumber || !year) {
      return 31;
    }
    return new Date(year, monthNumber, 0).getDate();
  }

  private getMonthLabel(monthNumber: number): string {
    return this.months.find(m => m.value === monthNumber)?.name || '';
  }

  private getChartTitle(): string {
    const monthNumber = this.filterForm.value.month;
    const year = this.filterForm.value.year;

    if (!monthNumber || !year) {
      return 'Scatter plot for Process Audits - All Data';
    }
    return `Scatter plot for Process Audits - ${this.getMonthLabel(monthNumber)} ${year}`;
  }

  initChart(data: [number, number][]): void {
    const daysInMonth = this.getDaysInMonth();

    this.chartOptions = {
      chart: {
        type: 'scatter',
        backgroundColor: '#ffffff'
      },
      title: {
        text: this.getChartTitle(),
        style: {
          fontSize: '24px',
          fontWeight: 'normal',
          color: '#333333'
        },
        margin: 40
      },
      xAxis: {
        title: {
          text: 'Day of the Month'
        },
        min: 1,
        max: daysInMonth,
        tickInterval: 1,
        gridLineWidth: 0,
        lineColor: '#ccd6eb',
        tickColor: '#ccd6eb'
      },
      yAxis: {
        title: {
          text: 'Score'
        },
        min: 0,
        max: 100,
        tickInterval: 10,
        gridLineColor: '#e6e6e6',
        gridLineWidth: 1
      },
      legend: {
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        x: 60,
        y: 60,
        floating: true,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 10,
        itemStyle: {
          fontWeight: 'normal'
        }
      },
      plotOptions: {
        scatter: {
          marker: {
            radius: 5,
            symbol: 'circle',
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: 'Day: {point.x}, Score %: {point.y}'
          }
        }
      },
      series: [{
        type: 'scatter',
        name: 'Score',
        color: '#b0c4de',
        data: data.length ? [...data] : []
      }],
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            symbolStroke: '#666',
            theme: {
              fill: 'transparent'
            }
          }
        }
      },
      credits: {
        enabled: true,
        text: 'Highcharts.com',
        position: {
          align: 'right',
          verticalAlign: 'bottom',
          x: -10,
          y: -5
        }
      }

    };


  }
}