import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
 

@Injectable({
  providedIn: 'root',
})
export class InternalPortalDashboardService {

   apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // --- Dashboard Data API ---
  getDashboardData(finYear?: string, commodityId?: number, severityId?: number): Observable<any> {
    let url = `${this.apiUrl}Dashboard/get-dashboard-data?`;
    
    if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
    if (commodityId) url += `commodityId=${commodityId}&`;
    if (severityId) url += `severityId=${severityId}`;
    
    return this.http.get(url);
  }

  // --- Dropdown APIs ---
  getCommodities(): Observable<any> { 
    return this.http.get(this.apiUrl + 'Commodity/get-commodities'); 
  }

  getSeverities(): Observable<any> { 
    return this.http.get(this.apiUrl + 'Severity/get-all'); 
  }

  // Add these below your existing getDashboardData method:
  
  getProcessChartData(finYear?: string, commodityId?: number): Observable<any> {
    let url = `${this.apiUrl}Dashboard/get-process-chart?`;
    if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
    if (commodityId) url += `commodityId=${commodityId}`;
    return this.http.get(url);
  }

  getPartsChartData(finYear?: string, commodityId?: number): Observable<any> {
    let url = `${this.apiUrl}Dashboard/get-parts-chart?`;
    if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
    if (commodityId) url += `commodityId=${commodityId}`;
    return this.http.get(url);
  }
  
}
