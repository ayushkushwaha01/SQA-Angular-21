import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'src/app/shared/alert.service';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';
import * as Highcharts from 'highcharts';

@Component({
  standalone: false,
  selector: 'app-parts-bellcurve',
  templateUrl: './parts-bellcurve.component.html',
  styleUrls: ['./parts-bellcurve.component.scss']
})
export class PartsBellcurveComponent implements OnInit {

  constructor(private dialog: MatDialog, private fb: FormBuilder,
    private alertService: AlertService, private api: CommodityService, private PartsAuditAnalayticsService: PartsAuditAnalayticsService
  ) { }
  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  ngOnInit(): void {
    this.forminit();
    this.getBellCurve();
  }
  // forminit() {
  //   this.filterForm = this.fb.group({

  //     Year: [null],
  //   });
  // }

   forminit() {
    const currentDate = new Date();
    this.filterForm = this.fb.group({

      Year: [currentDate.getFullYear()],
    });
  }
  onClearFilter() {
    this.filterForm.reset({

      Year: null,
    });
    this.getBellCurve();

  }

  getBellCurve() {

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

    this.PartsAuditAnalayticsService.getBellCurve(filter)
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            const categories = res.data.map((x: any) => x.range);

            const values = res.data.map((x: any) => x.count);

            this.chartOptions = {

              ...this.chartOptions,

              xAxis: {
                categories: categories,
                title: {
                  text: 'Percentage Range'
                },
                labels: {
                  style: {
                    fontSize: '15px'
                  },
                  rotation: 0,
                  reserveSpace: true
                },
                tickmarkPlacement: 'on',
                startOnTick: true,
                endOnTick: true
              },

              yAxis: {
                min: 0,
                allowDecimals: false,
                title: {
                  text: 'No. of Audits'
                },
                labels: {
                  style: { fontSize: '15px' }
                }
              },

              series: [{
                type: 'column',
                color: '#8cd3ef',
                data: values
              }]
            };

          }
        },
        error: (err) => {
          this.alertService.createAlert(
            err.error?.message || 'Unable to load Bell Curve',
            0
          );
        }
      });

  }

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: '#ffffff',
      spacingTop: 20,
      spacingRight: 40,
      spacingLeft: 20,
      spacingBottom: 20
    },

    title: {
      text: 'Bell Curve for Parts Audits',
      style: {
        fontSize: '26px',
        fontWeight: 'normal',
        color: '#333'
      }
    },

    xAxis: {
      categories: [],
      title: {
        text: 'Percentage Range',
        style: {
          fontSize: '16px'
        }
      },
      labels: {
        style: {
          fontSize: '15px'
        },
        rotation: 0,
        reserveSpace: true
      },
      tickmarkPlacement: 'on',
      startOnTick: true,
      endOnTick: true
    },

    yAxis: {
      min: 0,
      // max: 100 removed — let it auto-scale
      // tickInterval: 10 removed — fixed interval doesn't make sense once max is dynamic
      allowDecimals: false,
      title: {
        text: 'No. of Audits',
        style: { fontSize: '16px' }
      },
      labels: {
        style: { fontSize: '15px' }
      }
    },

    legend: {
      enabled: false
    },

    credits: {
      enabled: false
    },

    tooltip: {
      headerFormat: '',
      pointFormat:
        '<b>{point.category}</b><br/>No. of Audits : <b>{point.y}</b>'
    },

    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0.05,
        groupPadding: 0.08,
        color: '#8cd3ef'
      }
    },

    series: [{
      type: 'column',
      data: []
    }]
  };
}

