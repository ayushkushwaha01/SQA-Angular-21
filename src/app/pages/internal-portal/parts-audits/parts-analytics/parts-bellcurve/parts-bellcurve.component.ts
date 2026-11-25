// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { MatDialog } from '@angular/material/dialog';
// import { AlertService } from 'src/app/shared/alert.service';
// import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
// import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';
// import * as Highcharts from 'highcharts';

// @Component({
//   standalone: false,
//   selector: 'app-parts-bellcurve',
//   templateUrl: './parts-bellcurve.component.html',
//   styleUrls: ['./parts-bellcurve.component.scss']
// })
// export class PartsBellcurveComponent implements OnInit {

//   constructor(private dialog: MatDialog, private fb: FormBuilder,
//     private alertService: AlertService, private api: CommodityService, private PartsAuditAnalayticsService: PartsAuditAnalayticsService
//   ) { }
//   Highcharts: typeof Highcharts = Highcharts;
//   filterForm!: FormGroup;

//   ngOnInit(): void {
//     this.forminit();
//     this.getBellCurve();
//   }
//   // forminit() {
//   //   this.filterForm = this.fb.group({

//   //     Year: [null],
//   //   });
//   // }

//    forminit() {
//     const currentDate = new Date();
//     this.filterForm = this.fb.group({

//       Year: [currentDate.getFullYear()],
//     });
//   }
//   onClearFilter() {
//     this.filterForm.reset({

//       Year: null,
//     });
//     this.getBellCurve();

//   }

//   getBellCurve() {

//     const filter = { ...this.filterForm.value };

//     Object.keys(filter).forEach(key => {

//       if (
//         filter[key] === null ||
//         filter[key] === undefined ||
//         filter[key] === '' ||
//         filter[key] === 'null'
//       ) {
//         delete filter[key];
//       }

//     });

//     this.PartsAuditAnalayticsService.getBellCurve(filter)
//       .subscribe({
//         next: (res: any) => {

//           if (res.success) {

//             const categories = res.data.map((x: any) => x.range);

//             const values = res.data.map((x: any) => x.count);

//             this.chartOptions = {

//               ...this.chartOptions,

//               xAxis: {
//                 categories: categories,
//                 title: {
//                   text: 'Percentage Range'
//                 },
//                 labels: {
//                   style: {
//                     fontSize: '15px'
//                   },
//                   rotation: 0,
//                   reserveSpace: true
//                 },
//                 tickmarkPlacement: 'on',
//                 startOnTick: true,
//                 endOnTick: true
//               },

//               yAxis: {
//                 min: 0,
//                 allowDecimals: false,
//                 title: {
//                   text: 'No. of Audits'
//                 },
//                 labels: {
//                   style: { fontSize: '15px' }
//                 }
//               },

//               series: [{
//                 type: 'column',
//                 color: '#8cd3ef',
//                 data: values
//               }]
//             };

//           }
//         },
//         error: (err) => {
//           this.alertService.createAlert(
//             err.error?.message || 'Unable to load Bell Curve',
//             0
//           );
//         }
//       });

//   }

//   chartOptions: Highcharts.Options = {
//     chart: {
//       type: 'column',
//       backgroundColor: '#ffffff',
//       spacingTop: 20,
//       spacingRight: 40,
//       spacingLeft: 20,
//       spacingBottom: 20
//     },

//     title: {
//       text: 'Bell Curve for Parts Audits',
//       style: {
//         fontSize: '26px',
//         fontWeight: 'normal',
//         color: '#333'
//       }
//     },

//     xAxis: {
//       categories: [],
//       title: {
//         text: 'Percentage Range',
//         style: {
//           fontSize: '16px'
//         }
//       },
//       labels: {
//         style: {
//           fontSize: '15px'
//         },
//         rotation: 0,
//         reserveSpace: true
//       },
//       tickmarkPlacement: 'on',
//       startOnTick: true,
//       endOnTick: true
//     },

//     yAxis: {
//       min: 0,
//       // max: 100 removed — let it auto-scale
//       // tickInterval: 10 removed — fixed interval doesn't make sense once max is dynamic
//       allowDecimals: false,
//       title: {
//         text: 'No. of Audits',
//         style: { fontSize: '16px' }
//       },
//       labels: {
//         style: { fontSize: '15px' }
//       }
//     },

//     legend: {
//       enabled: false
//     },

//     credits: {
//       enabled: false
//     },

//     tooltip: {
//       headerFormat: '',
//       pointFormat:
//         '<b>{point.category}</b><br/>No. of Audits : <b>{point.y}</b>'
//     },

//     plotOptions: {
//       column: {
//         borderWidth: 0,
//         pointPadding: 0.05,
//         groupPadding: 0.08,
//         color: '#8cd3ef'
//       }
//     },

//     series: [{
//       type: 'column',
//       data: []
//     }]
//   };
// }



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

  constructor(
    private dialog: MatDialog, 
    private fb: FormBuilder,
    private alertService: AlertService, 
    private api: CommodityService, 
    private PartsAuditAnalayticsService: PartsAuditAnalayticsService
  ) { }
  
  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  // 1. UNIQUE SCREEN NAME FOR THE DATABASE
  private readonly SCREEN_NAME = 'PartsAnalyticsBellCurve';

  // 2. GET CURRENT USER ID (Grabs from localStorage or defaults to 0)
  private get currentUserId(): number {
    const userId = localStorage.getItem('UserId') || sessionStorage.getItem('UserId');
    return userId ? parseInt(userId, 10) : 0; 
  }

  ngOnInit(): void {
    this.forminit();
    
    // 3. RESTORE DB FILTERS BEFORE LOADING DATA
    this.restoreDbFilters();
  }

  forminit() {
    const currentDate = new Date();
    this.filterForm = this.fb.group({
      Year: [currentDate.getFullYear()],
    });
  }

  /**
   * Retrieves saved filter state from the DB and patches the reactive form.
   */
  private restoreDbFilters(): void {
    this.PartsAuditAnalayticsService.getUserFilters(this.currentUserId, this.SCREEN_NAME).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          try {
            const parsed = JSON.parse(res.data);
            const currentDate = new Date();
            this.filterForm.patchValue({
              Year: parsed.Year !== undefined ? parsed.Year : currentDate.getFullYear()
            });
          } catch (e) {
            console.error('Failed to parse DB filters', e);
          }
        }
        // Load data AFTER filters are restored
        this.getBellCurve();
      },
      error: () => {
        // Fallback if API fails
        this.getBellCurve();
      }
    });
  }

  /**
   * Silently saves current form values to DB
   */
  private saveCurrentFiltersToDb(): void {
    const payload = {
      userId: this.currentUserId,
      screenName: this.SCREEN_NAME,
      filterJSON: JSON.stringify(this.filterForm.value)
    };
    this.PartsAuditAnalayticsService.saveUserFilters(payload).subscribe();
  }

  onClearFilter() {
    this.filterForm.reset({
      Year: null,
    });
    
    // Save empty state to DB
    this.saveCurrentFiltersToDb();
    
    this.getBellCurve();
  }

  getBellCurve() {
    // 4. SAVE FILTERS TO DB EVERY TIME 'GO' IS CLICKED OR DATA IS REFRESHED
    this.saveCurrentFiltersToDb();

    const filter = { ...this.filterForm.value };

    // Clean up empty params
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