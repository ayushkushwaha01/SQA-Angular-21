import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessAnalyticsService {
  private apiUrl = environment.apiUrl + 'ProcessAnalytics/';

  constructor(private http: HttpClient) { }

  getActionsAnalytics(commodityId?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (commodityId) params = params.set('commodityId', commodityId.toString());
    if (year) params = params.set('year', year.toString());
    return this.http.get(this.apiUrl + 'get-actions-analytics', { params });
  }

  getScatterAnalytics(month?: string, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year.toString());
    return this.http.get(this.apiUrl + 'get-scatter-analytics', { params });
  }

  getBellCurveAnalytics(commodityId?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (commodityId) params = params.set('commodityId', commodityId.toString());
    if (year) params = params.set('year', year.toString());
    return this.http.get(this.apiUrl + 'get-bellcurve-analytics', { params });
  }

  getParetoAnalytics(commodityId?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (commodityId) params = params.set('commodityId', commodityId.toString());
    if (year) params = params.set('year', year.toString());
    return this.http.get(this.apiUrl + 'get-pareto-analytics', { params });
  }

  // 🔥 ADDED HERE: Summary Analytics API Call
  getSummaryAnalytics(commodityId?: number, auditorId?: number, year?: number, month?: number): Observable<any> {
    let params = new HttpParams();
    if (commodityId) params = params.set('commodityId', commodityId.toString());
    if (auditorId) params = params.set('auditorId', auditorId.toString());
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get(this.apiUrl + 'get-summary-analytics', { params });
  }
}