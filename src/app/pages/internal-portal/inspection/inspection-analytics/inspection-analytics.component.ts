import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import * as Highcharts from 'highcharts';
import { DefectsPopMasterComponent } from '../inspection-datatable/defects-pop-master/defects-pop-master.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of, Subscription, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InspectionService } from '../inspection.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-inspection-analytics',
  templateUrl: './inspection-analytics.component.html',
  styleUrls: ['./inspection-analytics.component.scss']
})
export class InspectionAnalyticsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  Highcharts: typeof Highcharts = Highcharts;

  chartsReady = false;
  updateFlag = false;
  isLoading = false;
  private activeSub?: Subscription;

  isDailyView = false;
  showFilter = false;

  // Filter Data
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12
  selectedDay: number = new Date().getDate();

  availableYears = [2024, 2025, 2026, 2027];
  availableMonths = [
    { value: 1, name: 'Jan' }, { value: 2, name: 'Feb' }, { value: 3, name: 'Mar' },
    { value: 4, name: 'Apr' }, { value: 5, name: 'May' }, { value: 6, name: 'Jun' },
    { value: 7, name: 'Jul' }, { value: 8, name: 'Aug' }, { value: 9, name: 'Sep' },
    { value: 10, name: 'Oct' }, { value: 11, name: 'Nov' }, { value: 12, name: 'Dec' }
  ];
  availableDays: number[] = [];

  // Active Data Variables
  activeIncoming = '0%';
  activeStartUp = '0%';
  activeProcess = '0%';
  activeFinal = '0%';

  activeAnnualPpmOptions: Highcharts.Options = {};
  activeMonthlyPpmOptions: Highcharts.Options = {};
  activeDefectsPieOptions: Highcharts.Options = {};
  activeProductsPieOptions: Highcharts.Options = {};

  topDefectsLeft: any[] = [];
  topDefectsRight: any[] = [];
  activeInspectorActivities: any[] = [];
  paginatedInspectorActivities: any[] = [];

  pieColors = ['#2caffe', '#544fc5', '#00e272', '#fe6a35', '#6b8abc', '#d568fb', '#2ee0ca', '#fa4b42', '#feb56a', '#91e8e1'];

  constructor(
    private dialog: MatDialog,
    private inspectionService: InspectionService
  ) { }

  canRead: boolean = false;
  readonly SCREEN_ID: number = 26; // Screen ID for Process Analytics

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);

    // 🔥 If they can't read, stop loading charts/API calls
    if (!this.canRead) return;
    this.updateDaysInMonth();
    this.fetchAnalyticsData();
  }

  updateDaysInMonth(): void {
    const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.availableDays = Array.from({ length: days }, (_, i) => i + 1);

    if (this.selectedDay > days) {
      this.selectedDay = days;
    }

    this.inspectionService.selectedYear = this.selectedYear;
    this.inspectionService.selectedMonth = this.selectedMonth;
  }

  private safeCall(obs: any): Observable<any> {
    return obs.pipe(
      catchError(err => {
        console.warn('Analytics API error on endpoint:', err);
        return of({ data: [] });
      })
    );
  }

  fetchAnalyticsData(): void {
    if (this.activeSub) {
      this.activeSub.unsubscribe();
    }
    this.isLoading = true;
    if (this.isDailyView) {
      this.setDailyData();
    } else {
      this.setMonthlyData();
    }
  }

  switchToDaily(): void {
    if (!this.isDailyView) {
      this.isDailyView = true;
      if (this.paginator) this.paginator.firstPage();
      this.fetchAnalyticsData();
    }
  }

  switchToMonthly(): void {
    if (this.isDailyView) {
      this.isDailyView = false;
      if (this.paginator) this.paginator.firstPage();
      this.fetchAnalyticsData();
    }
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  private extractDataList(response: any): any[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.Data)) return response.Data;
    return [];
  }

  private populateTopDefects(topDefectResponse: any, allDefectsList: any[]): void {
    let list = this.extractDataList(topDefectResponse);

    // If dedicated top-defects endpoint returned empty or failed, fallback to sorting all defects descending by count!
    if (!list || list.length === 0) {
      list = [...allDefectsList].sort((a: any, b: any) => {
        const countA = Number(a.count ?? a.qty ?? a.quantity ?? 0);
        const countB = Number(b.count ?? b.qty ?? b.quantity ?? 0);
        return countB - countA;
      });
    }

    const mappedTableDefects = list.map((item: any) => ({
      defect: item.defectName || item.defect || item.name || '',
      qty: Number(item.count ?? item.qty ?? item.quantity ?? 0)
    }));

    this.topDefectsLeft = mappedTableDefects.slice(0, 5);
    this.topDefectsRight = mappedTableDefects.slice(5, 10);
  }

  setMonthlyData(): void {
    const currentYear = this.selectedYear;
    const currentMonth = this.selectedMonth;

    this.activeSub = forkJoin({
      annualPpm: this.safeCall(this.inspectionService.getMonthlyErrorRates(currentYear)),
      monthlyPpm: this.safeCall(this.inspectionService.getDailyErrorRates(currentYear, currentMonth)),
      partFamilies: this.safeCall(this.inspectionService.getMonthlyPartFamilyCounts(currentYear, currentMonth)),
      allDefects: this.safeCall(this.inspectionService.getMonthlyDefectCounts(currentYear, currentMonth)),
      topDefects: this.safeCall(this.inspectionService.getTopDefectCounts(currentYear, currentMonth)),
      inspectors: this.safeCall(this.inspectionService.getTopInspectorCounts(currentYear, currentMonth))
    }).subscribe({
      next: (responses: any) => {
        // Guard against race condition if user switched to Daily View in the meantime
        if (this.isDailyView) return;

        const annualDataList = this.extractDataList(responses.annualPpm);
        const annualCats = annualDataList.map((d: any) => d.monthName);
        const annualValues = annualDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
        this.activeAnnualPpmOptions = this.createColumnChart(`Annual Defect Rate PPM Trend (${currentYear})`, 'PPM', annualCats, annualValues);

        const monthlyDataList = this.extractDataList(responses.monthlyPpm);
        const monthlyCats = monthlyDataList.map((d: any) => d.dayNumber ? d.dayNumber.toString() : '');
        const monthlyValues = monthlyDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
        this.activeMonthlyPpmOptions = this.createSplineChart(`Daily Defect Rate PPM Trend (${currentMonth}/${currentYear})`, 'PPM', monthlyCats, monthlyValues);

        const allDefectList = this.extractDataList(responses.allDefects);
        this.activeDefectsPieOptions = this.createPieChart(
          allDefectList.map((item: any, index: number) => ({
            name: item.defectName || item.defect || item.name,
            y: Number(item.count ?? item.qty ?? item.quantity ?? 0),
            color: this.pieColors[index % this.pieColors.length]
          }))
        );

        this.populateTopDefects(responses.topDefects, allDefectList);

        const pfList = this.extractDataList(responses.partFamilies);
        this.activeProductsPieOptions = this.createPieChart(
          pfList.map((item: any, index: number) => ({
            name: item.partFamilyName || item.name,
            y: Number(item.count ?? item.qty ?? item.quantity ?? 0),
            color: this.pieColors[index % this.pieColors.length]
          }))
        );

        const inspectorDocs = this.extractDataList(responses.inspectors);
        this.activeInspectorActivities = inspectorDocs.map((item: any) => ({
          inspector: item.inspectorName || item.name,
          qty: item.count ?? item.qty ?? 0,
          records: item.count ?? item.qty ?? 0,
          ppm: 'N/A'
        }));

        this.updatePaginatedData({ pageIndex: 0, pageSize: 5, length: this.activeInspectorActivities.length });

        this.chartsReady = true;
        this.isLoading = false;
        this.updateFlag = true;
      },
      error: () => {
        this.chartsReady = true;
        this.isLoading = false;
      }
    });
  }

  setDailyData(): void {
    const currentYear = this.selectedYear;
    const currentMonth = this.selectedMonth;
    const currentDay = this.selectedDay;

    this.activeSub = forkJoin({
      hourlyPpm: this.safeCall(this.inspectionService.getHourlyErrorRates(currentYear, currentMonth, currentDay)),
      shiftPpm: this.safeCall(this.inspectionService.getShiftErrorRates(currentYear, currentMonth, currentDay)),
      partFamilies: this.safeCall(this.inspectionService.getDailyPartFamilyCounts(currentYear, currentMonth, currentDay)),
      allDefects: this.safeCall(this.inspectionService.getDailyDefectCounts(currentYear, currentMonth, currentDay)),
      topDefects: this.safeCall(this.inspectionService.getTopDefectCounts(currentYear, currentMonth, currentDay)),
      inspectors: this.safeCall(this.inspectionService.getTopInspectorCounts(currentYear, currentMonth, currentDay))
    }).subscribe({
      next: (responses: any) => {
        // Guard against race condition if user switched to Monthly View in the meantime
        if (!this.isDailyView) return;

        const hourlyDataList = this.extractDataList(responses.hourlyPpm);
        const hourlyCats = hourlyDataList.map((d: any) => d.time);
        const hourlyValues = hourlyDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
        this.activeAnnualPpmOptions = this.createColumnChart(`Hourly PPM Trend (${currentDay}/${currentMonth}/${currentYear})`, 'PPM', hourlyCats, hourlyValues);

        const shiftDataList = this.extractDataList(responses.shiftPpm);
        const shiftCats = shiftDataList.map((d: any) => d.shiftName);
        const shiftValues = shiftDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
        this.activeMonthlyPpmOptions = this.createSplineChart(`Shift PPM Trend`, 'PPM', shiftCats, shiftValues);

        const allDefectList = this.extractDataList(responses.allDefects);
        this.activeDefectsPieOptions = this.createPieChart(
          allDefectList.map((item: any, index: number) => ({
            name: item.defectName || item.defect || item.name,
            y: Number(item.count ?? item.qty ?? item.quantity ?? 0),
            color: this.pieColors[index % this.pieColors.length]
          }))
        );

        this.populateTopDefects(responses.topDefects, allDefectList);

        const pfList = this.extractDataList(responses.partFamilies);
        this.activeProductsPieOptions = this.createPieChart(
          pfList.map((item: any, index: number) => ({
            name: item.partFamilyName || item.name,
            y: Number(item.count ?? item.qty ?? item.quantity ?? 0),
            color: this.pieColors[index % this.pieColors.length]
          }))
        );

        const inspectorDocs = this.extractDataList(responses.inspectors);
        this.activeInspectorActivities = inspectorDocs.map((item: any) => ({
          inspector: item.inspectorName || item.name,
          qty: item.count ?? item.qty ?? 0,
          records: item.count ?? item.qty ?? 0,
          ppm: 'N/A'
        }));

        this.updatePaginatedData({ pageIndex: 0, pageSize: 5, length: this.activeInspectorActivities.length });

        this.chartsReady = true;
        this.isLoading = false;
        this.updateFlag = true;
      },
      error: () => {
        this.chartsReady = true;
        this.isLoading = false;
      }
    });
  }

  handlePageEvent(event: PageEvent) {
    this.updatePaginatedData(event);
  }

  updatePaginatedData(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.activeInspectorActivities.length) {
      endIndex = this.activeInspectorActivities.length;
    }
    this.paginatedInspectorActivities = this.activeInspectorActivities.slice(startIndex, endIndex);
  }

  createColumnChart(title: string, yTitle: string, categories: string[], data: number[]): Highcharts.Options {
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Roboto, "Helvetica Neue", sans-serif' }
      },
      title: {
        text: title,
        style: { color: '#1e293b', fontWeight: '600', fontSize: '15px' }
      },
      xAxis: {
        categories: categories,
        labels: { style: { color: '#475569', fontSize: '12px' } },
        lineColor: '#cbd5e1',
        tickColor: '#cbd5e1'
      },
      yAxis: {
        title: { text: yTitle, style: { color: '#475569', fontSize: '12px' } },
        labels: { style: { color: '#475569', fontSize: '12px' } },
        gridLineColor: '#f1f5f9',
        min: 0
      },
      series: [{
        type: 'column',
        name: yTitle,
        data: data,
        color: '#2caffe',
        borderRadius: 4
      }],
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderRadius: 8,
        shadow: true,
        style: { color: '#1e293b', fontSize: '12px' }
      },
      exporting: { enabled: false },
      credits: { enabled: false },
      legend: { enabled: false },
      accessibility: { enabled: false }
    };
  }

  createSplineChart(title: string, yTitle: string, categories: string[], data: number[]): Highcharts.Options {
    return {
      chart: {
        type: 'spline',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Roboto, "Helvetica Neue", sans-serif' }
      },
      title: {
        text: title,
        style: { color: '#1e293b', fontWeight: '600', fontSize: '15px' }
      },
      xAxis: {
        categories: categories,
        labels: { style: { color: '#475569', fontSize: '12px' } },
        lineColor: '#cbd5e1',
        tickColor: '#cbd5e1'
      },
      yAxis: {
        title: { text: yTitle, style: { color: '#475569', fontSize: '12px' } },
        labels: { style: { color: '#475569', fontSize: '12px' } },
        gridLineColor: '#f1f5f9',
        min: 0
      },
      series: [{
        type: 'spline',
        name: yTitle,
        data: data,
        color: '#2caffe',
        marker: {
          fillColor: '#2caffe',
          lineWidth: 2,
          lineColor: '#ffffff'
        }
      }],
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderRadius: 8,
        shadow: true,
        style: { color: '#1e293b', fontSize: '12px' }
      },
      exporting: { enabled: false },
      credits: { enabled: false },
      legend: { enabled: false },
      accessibility: { enabled: false }
    };
  }

  createPieChart(data: any[]): Highcharts.Options {
    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Roboto, "Helvetica Neue", sans-serif' }
      },
      title: { text: '' },
      plotOptions: {
        pie: {
          innerSize: '50%',
          borderWidth: 2,
          borderColor: '#ffffff',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            style: { color: '#334155', fontSize: '11px', textOutline: 'none' }
          }
        }
      },
      series: [{ type: 'pie', innerSize: '50%', data: data }],
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderRadius: 8,
        shadow: true,
        style: { color: '#1e293b', fontSize: '12px' },
        pointFormat: '{point.y} ({point.percentage:.1f}%)'
      },
      exporting: { enabled: false },
      credits: { enabled: false },
      accessibility: { enabled: false }
    };
  }

  openheatmapname() {
    this.dialog.open(DefectsPopMasterComponent, {
      width: '1400px',
      height: 'auto',
      data: {
        year: this.selectedYear,
        month: this.selectedMonth
      }
    });
  }
}