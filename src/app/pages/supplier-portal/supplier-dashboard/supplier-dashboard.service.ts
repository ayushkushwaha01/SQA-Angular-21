import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierDashboardService {
  
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // getDashboardData(supplierId: number, finYear?: string, commodityId?: number, severityId?: number): Observable<any> {
  //   let url = `${this.apiUrl}SupplierDashboard/get-dashboard-data?supplierId=${supplierId}&`;
  //   if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
  //   if (commodityId) url += `commodityId=${commodityId}&`;
  //   if (severityId) url += `severityId=${severityId}`;
  //   return this.http.get(url);
  // }

  // getProcessChartData(supplierId: number, finYear?: string, commodityId?: number): Observable<any> {
  //   let url = `${this.apiUrl}SupplierDashboard/get-process-chart?supplierId=${supplierId}&`;
  //   if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
  //   if (commodityId) url += `commodityId=${commodityId}`;
  //   return this.http.get(url);
  // }

  // getPartsChartData(supplierId: number, finYear?: string, commodityId?: number): Observable<any> {
  //   let url = `${this.apiUrl}SupplierDashboard/get-parts-chart?supplierId=${supplierId}&`;
  //   if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
  //   if (commodityId) url += `commodityId=${commodityId}`;
  //   return this.http.get(url);
  // }


  // 🔥 Removed supplierId parameter
  getDashboardData(finYear?: string, commodityId?: number, severityId?: number): Observable<any> {
    let url = `${this.apiUrl}SupplierDashboard/get-dashboard-data?`; // Removed supplierId=
    if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
    if (commodityId) url += `commodityId=${commodityId}&`;
    if (severityId) url += `severityId=${severityId}`;
    return this.http.get(url);
  }

  getProcessChartData(finYear?: string, commodityId?: number): Observable<any> {
    let url = `${this.apiUrl}SupplierDashboard/get-process-chart?`;
    if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
    if (commodityId) url += `commodityId=${commodityId}`;
    return this.http.get(url);
  }

  getPartsChartData(finYear?: string, commodityId?: number): Observable<any> {
    let url = `${this.apiUrl}SupplierDashboard/get-parts-chart?`;
    if (finYear) url += `finYear=${encodeURIComponent(finYear)}&`;
    if (commodityId) url += `commodityId=${commodityId}`;
    return this.http.get(url);
  }

  
  getCommodities(): Observable<any> { return this.http.get(this.apiUrl + 'Commodity/get-commodities'); }
  getSeverities(): Observable<any> { return this.http.get(this.apiUrl + 'Severity/get-all'); }
}