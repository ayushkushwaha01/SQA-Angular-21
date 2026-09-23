import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import html2pdf from 'html2pdf.js';
import { PartAuditService } from '../../parts-audits/part-audit.service';
import { PartsAuditAnalayticsService } from '../../process-audits/paudits-analytics/parts-audit-analaytics.service';

const initPlugin = (plugin: any, hc: any) => {
  if (typeof plugin === 'function') {
    plugin(hc);
  } else if (plugin?.default && typeof plugin.default === 'function') {
    plugin.default(hc);
  }
};
initPlugin(HighchartsMore, Highcharts);
initPlugin(HighchartsSolidGauge, Highcharts);
@Component({
  standalone: false,
  selector: 'app-pdfref',
  templateUrl: './pdfref.component.html',
  styleUrls: ['./pdfref.component.scss']
})
export class PdfrefComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  reportData: any = null;
  ratingChartOptions: Highcharts.Options = {};
  sodGaugeOptions: Highcharts.Options = {};
  spiderChartOptions: Highcharts.Options = {};
  loading = true;
  generatingPdf = false;

  private ringColors = ['#0284c7', '#9333ea', '#0d9488', '#d97706', '#16a34a', '#dc2626', '#4f46e5', '#0891b2'];
  getRingColor(i: number): string {
    return this.ringColors[i % this.ringColors.length];
  }
  getRatingColorByName(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('5') || n.includes('excellent')) return '#16a34a';
    if (n.includes('4') || n.includes('good')) return '#65a30d';
    if (n.includes('3') || n.includes('satisfactory')) return '#d97706';
    if (n.includes('2') || n.includes('minor')) return '#ea580c';
    if (n.includes('1') || n.includes('major')) return '#dc2626';
    return '#94a3b8';
  }

  constructor(
    private route: ActivatedRoute, private location: Location,
    private PartAuditDashboardService: PartsAuditAnalayticsService
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const partAuditId = +params['partAuditId'];

      if (partAuditId) {
        this.loadReport(partAuditId);
      }

    });

  }
  loadReport(partAuditId: number) {

    this.loading = true;

    this.PartAuditDashboardService
      .getPdf({ PartAuditId: partAuditId })
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            const d = res.data;

            this.reportData = {

              header: {

                auditReference: d.auditDetails.partAuditId,

                commodityName: d.auditDetails.commodityName,

                supplierName: d.auditDetails.supplierName,

                cityName: d.auditDetails.cityName,

                stateName: d.auditDetails.stateName,

                auditorName: d.auditDetails.auditorName,

                auditDate: d.auditDetails.auditDate,

                overallScore: d.auditDetails.okayPercentage + '%',

                subject: d.auditDetails.subject,
                description: d.auditDetails.description

              },

              sodRiskScore: d.displaySODScore,

              categoryScores: d.categoryPerformance,

              ncStatus: this.buildNcStatus(d.statusDistribution),
              ratingDistribution: d.riskRatingDistribution || [],
              majorNCs: d.topCriticalNCs,

              improvementPoints: d.topSafetyNCs,

              forgingProcess: d.forgingProcess

            };

            this.initCharts();

          }

          this.loading = false;

        },

        error: () => {

          this.loading = false;

        }

      });

  }

  goBack(): void {
    this.location.back();
  }

  buildNcStatus(statusData: any[]) {

    return {

      totalNC: statusData.reduce((a: number, b: any) => a + b.count, 0),

      closed:
        statusData.find(x =>
          x.statusName.toLowerCase().includes('closed'))?.count || 0,

      rcaInProgress:
        statusData.find(x =>
          x.statusName.toLowerCase().includes('rca'))?.count || 0,

      cmIdentified:
        statusData.find(x =>
          x.statusName.toLowerCase().includes('identified'))?.count || 0,

      cmImplementing:
        statusData.find(x =>
          x.statusName.toLowerCase().includes('implement'))?.count || 0

    };

  }

  initCharts(): void {
    // 1. FINDING DISTRIBUTION DONUT CHART
    // 1. FINDING DISTRIBUTION DONUT CHART

    const rawDist = (this.reportData.ratingDistribution || []) as any[];

    const pieSeriesData = rawDist.map((item: any) => {

      const name = item.riskRating || 'Rating';

      const y = item.count ?? 0;

      return {
        name: name,
        y: y,
        color: this.getRatingColorByName(name)
      };

    });

    this.ratingChartOptions = {

      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: 155,
        animation: false,
        margin: [0, 0, 0, 0]
      },

      title: {
        text: ''
      },

      credits: {
        enabled: false
      },

      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y})'
      },

      legend: {
        enabled: true,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',

        itemStyle: {
          fontSize: '9px',
          fontWeight: '600',
          color: '#334155'
        },

        symbolHeight: 8,
        symbolWidth: 8,
        symbolRadius: 4,
        margin: 2
      },

      plotOptions: {

        pie: {

          innerSize: '55%',
          size: '85%',
          animation: false,
          showInLegend: true,

          dataLabels: {
            enabled: true,
            distance: 4,
            format: '{point.percentage:.0f}%',

            style: {
              fontSize: '9px',
              fontWeight: '700',
              color: '#1e293b',
              textOutline: 'none'
            }
          }

        }

      },

      series: [
        {
          type: 'pie',
          name: 'Ratings',
          data: pieSeriesData
        }
      ]

    };

    // 2. SOD RISK SCORE GAUGE
    // 2. SOD RISK SCORE GAUGE (speedometer style)
    const sodScore = this.reportData.sodRiskScore || 0;

    this.sodGaugeOptions = {
      chart: {
        type: 'gauge',
        backgroundColor: 'transparent',
        height: 220,
        margin: [0, 0, 0, 0],
        animation: false
      },
      title: { text: '' },
      credits: { enabled: false },
      pane: {
        startAngle: -90,
        endAngle: 90,
        center: ['50%', '85%'],
        size: '150%',
        background: undefined
      },
      tooltip: { enabled: false },
      yAxis: {
        min: 0,
        max: 1000,
        tickInterval: 100,
        minorTickInterval: undefined,
        tickWidth: 1,
        tickLength: 6,
        tickColor: '#333',
        labels: {
          distance: 12,
          style: { fontSize: '9px', color: '#334155' }
        },
        lineWidth: 0,
        plotBands: [
          {
            from: 0, to: 250, color: '#16a34a', thickness: 20,
            label: {
              text: 'Excellent',
              style: { fontSize: '9px', fontWeight: 'bold', color: '#fff' },
              rotation: -67
            }
          },
          {
            from: 250, to: 500, color: '#84cc16', thickness: 20,
            label: {
              text: 'Good',
              style: { fontSize: '9px', fontWeight: 'bold', color: '#fff' },
              rotation: -22
            }
          },
          {
            from: 500, to: 750, color: '#f97316', thickness: 20,
            label: {
              text: 'Average',
              style: { fontSize: '9px', fontWeight: 'bold', color: '#fff' },
              rotation: 22
            }
          },
          {
            from: 750, to: 1000, color: '#dc2626', thickness: 20,
            label: {
              text: 'Poor',
              style: { fontSize: '9px', fontWeight: 'bold', color: '#fff' },
              rotation: 67
            }
          }
        ]
      },
      series: [{
        type: 'gauge',
        name: 'SOD Score',
        data: [sodScore],
        dial: {
          radius: '75%',
          backgroundColor: '#000',
          baseWidth: 10,
          baseLength: '0%',
          rearLength: '0%'
        },
        pivot: {
          radius: 7,
          backgroundColor: '#000'
        },
        dataLabels: {
          enabled: false
        }
      }] as any
    };

    // 3. RADAR / SPIDER CHART
    const forging = this.reportData.forgingProcess || [];

    const safeNum = (val: any): number => {
      const n = Number(val);
      if (isNaN(n) || n < 0) return 0;
      return Math.min(n, 10);
    };

    const catNames = forging.map((x: any) => x.categoryName);
    const severityData = forging.map((x: any) => safeNum(x.averageSeverity));
    const occurrenceData = forging.map((x: any) => safeNum(x.averageOccurrence));
    const detectionData = forging.map((x: any) => safeNum(x.averageDetection));
    this.spiderChartOptions = {
      chart: {
        polar: true,
        type: 'line',
        backgroundColor: 'transparent',
        height: 220,
        animation: false,
        margin: [20, 25, 40, 25]
      },
      pane: { size: '65%' },
      title: { text: '' },
      credits: { enabled: false },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { fontSize: '8.5px', fontWeight: '600', color: '#334155' },
        symbolHeight: 8,
        symbolWidth: 14,
        y: 8
      },
      xAxis: {
        categories: catNames,
        tickmarkPlacement: 'on',
        lineWidth: 0,
        labels: { style: { fontSize: '8px', fontWeight: '600', color: '#334155' } }
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 10,
        tickInterval: 2,
        labels: { style: { fontSize: '8px', color: '#94a3b8' } }
      },
      tooltip: { shared: true, pointFormat: '<b>{series.name}: {point.y}</b><br/>' },
      series: [

        // 🔴 Severity
        {
          type: 'area',
          name: 'Severity',
          data: severityData,
          color: '#dc2626',
          pointPlacement: 'on',
          lineWidth: 2,

          fillColor: 'rgba(220, 38, 38, 0.08)',

          marker: {
            enabled: false
          }
        } as any,

        // 🟡 Occurrence
        {
          type: 'area',
          name: 'Occurrence',
          data: occurrenceData,
          color: '#eab308',
          pointPlacement: 'on',
          lineWidth: 2,

          fillColor: 'rgba(234, 179, 8, 0.08)',

          marker: {
            enabled: false
          }
        } as any,

        // 🟢 Detection
        {
          type: 'area',
          name: 'Detection',
          data: detectionData,
          color: '#16a34a',
          pointPlacement: 'on',
          lineWidth: 2,

          fillColor: 'rgba(22, 163, 74, 0.08)',

          marker: {
            enabled: false
          }
        } as any

      ]
    };
  }

  // --- HELPER LOGIC FOR NC STATUS & VERDICTS ---
  getNcPercentage(value: number | undefined): number {
    const total = this.reportData?.ncStatus?.totalNC || 0;
    if (!total || !value) return 0;
    return Math.round((value / total) * 100);
  }

  private getBandKeyword(): string {
    const subject = (this.reportData?.header?.subject || '').toLowerCase();
    if (subject.includes('excellent')) return 'excellent';
    if (subject.includes('good')) return 'good';
    if (subject.includes('average')) return 'average';
    if (subject.includes('poor')) return 'poor';
    return 'good'; // fallback
  }

  getVerdictClass(): string {
    return this.getBandKeyword(); // 'excellent' | 'good' | 'average' | 'poor'
  }

  getVerdictTitle(): string {
    const band = this.getBandKeyword();
    const map: { [key: string]: string } = {
      excellent: 'EXCELLENT SUPPLIER',
      good: 'GOOD SUPPLIER',
      average: 'AVERAGE SUPPLIER',
      poor: 'POOR SUPPLIER'
    };
    return map[band];
  }

  getVerdictSubtitle(): string {
    if (this.reportData?.header?.description) {
      return this.reportData.header.description;
    }
    const band = this.getBandKeyword();
    const map: { [key: string]: string } = {
      excellent: 'AUDIT PERFORMANCE ABOVE STANDARD',
      good: 'STANDARD AUDIT COMPLIANCE MET',
      average: 'MONITOR PROCESS DEVIATIONS',
      poor: 'ADDRESS ALL MAJOR NCs IMMEDIATELY'
    };
    return map[band];
  }
  isScoreLow(): boolean {
    const raw = this.reportData?.header?.overallScore || '0%';
    const numeric = parseInt(raw.replace('%', ''), 10) || 0;
    return numeric < 60;
  }

  isRiskHigh(): boolean {
    return (this.reportData?.sodRiskScore || 0) >= 300;
  }

  // --- PDF GENERATION LOGIC ---
  openPdfInNewTab(): void {
    const el = document.getElementById('pdf-report-content');
    if (!el) return;
    this.generatingPdf = true;
    (html2pdf as any)().set(this.getPdfOpt()).from(el).outputPdf('bloburl').then((url: string) => {
      window.open(url, '_blank');
      this.generatingPdf = false;
    }).catch(() => { this.generatingPdf = false; });
  }

  downloadPdf(): void {
    const el = document.getElementById('pdf-report-content');
    if (!el) return;
    this.generatingPdf = true;
    (html2pdf as any)().set(this.getPdfOpt()).from(el).save().then(() => {
      this.generatingPdf = false;
    }).catch(() => { this.generatingPdf = false; });
  }

  private getPdfOpt() {
    const ref = String(this.reportData?.header?.auditReference || 'Report').replace(/[\\/]/g, '_');
    return {
      margin: 0.2,
      filename: 'Audit_Summary_Report_' + ref + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };
  }
}


