import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartsAuditAnalayticsService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPartsAuditCapaaAnalytics(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/capa-analytics', { params: filter });
  }
  getPartsAuditCapaPercentage(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/capa-aging-percentage', { params: filter });
  }
  getScatterChart(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/get-scatter-chart', { params: filter });
  }
  getBellCurve(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/get-bell-curve', { params: filter });
  }
  getCapaDashboardSummary(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/capa-dashboard-summary', { params: filter });
  }
  getDashboardPareto(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/get-dashboard-pareto', { params: filter });
  }
  getDashboardperformance(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/get-performance', { params: filter });
  }
  getPdf(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditDashboard/get-pdf', {
      params: filter
    });
  }


  //commdoity
  getCommodityRatingDistribution(filter: any) {
    // Assuming this maps to your ProcessAnalyticsController
    return this.http.get(this.apiUrl + 'ProcessAnalytics/get-commodity-rating-distribution', { params: filter });
  }



}
