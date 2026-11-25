import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class InspectionService {
  apiUrl = environment.apiUrl;

  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  constructor(private http: HttpClient) { }

  getAllInspections(supplierId?: number): Observable<any> {
    let url = `${this.apiUrl}DataTable/get-all-records`;

    // 🔥 Only append the query parameter if supplierId is actually provided and is a number
    if (supplierId !== undefined && supplierId !== null) {
      url += `?supplierId=${supplierId}`;
    }

    return this.http.get(url);
  }

  // ---- Server-side paged lists ----
  // Expected response: { success, data: [...page rows], totalCount, filterOptions?, chartCounts? }
  private toQuery(params: any): string {
    return Object.keys(params)
      .filter(k => params[k] !== null && params[k] !== undefined && params[k] !== '')
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
  }

  getInspectionsPaged(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}DataTable/get-paged-records?${this.toQuery(params)}`);
  }

  getArchivedPaged(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}DataTable/get-paged-archive?${this.toQuery(params)}`);
  }

  getPendingCapaPaged(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionCapa/GetPendingCapaRecordsPaged?${this.toQuery(params)}`);
  }

  addInspection(data: any): Observable<any> {
    return this.http.post(this.apiUrl + "DataTable/add-record", data);
  }

  updateInspection(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}DataTable/update-record/${id}`, data);
  }

  deleteInspection(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}DataTable/delete-record/${id}`);
  }

  archiveInspection(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}DataTable/archive-record/${id}`, {});
  }

  togglePublish(id: number, isPublished: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}DataTable/toggle-publish/${id}/${isPublished}`,
      {},
    );
  }

  getInspectionParameters(inspectionId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}InspectionRef/GetParametersByInspectionId/${inspectionId}`,
    );
  }

  addOrUpdateInspectionParameter(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}InspectionRef/AddOrUpdateParameter`,
      data,
    );
  }

  updateSampleValues(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionRef/UpdateSamples`, data);
  }

  toggleOkayStatus(id: number, status: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}InspectionRef/toggle-ok/${id}?status=${status}`,
      {}
    );
  }

  getCapaByInspectionRefId(inspectionRefId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionCapa/GetCapaByInspectionId/${inspectionRefId}`);
  }

  saveCapa(capaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionCapa/SaveCapa`, capaData);
  }

  deleteCapaDocument(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionCapa/delete-document`, payload);
  }

  getDefectsByInspection(inspectionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionDefects/GetDefectsByInspection/${inspectionId}`);
  }

  updateDefectsStatus(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionDefects/UpdateDefectsStatus`, payload);
  }

  getPendingCapaRecords(supplierId?: number): Observable<any> {
    let url = `${this.apiUrl}InspectionCapa/GetPendingCapaRecords`;
    if (supplierId !== undefined && supplierId !== null) {
      url += `?supplierId=${supplierId}`;
    }
    return this.http.get(url);
  }

  updateCapaInlineStatus(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}InspectionCapa/UpdateInlineStatus`, payload);
  }

  getCapaDocuments(capaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionCapa/GetCapaDocuments/${capaId}`);
  }

  updateCapaDetails(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}InspectionCapa/UpdateCapaDetails`, payload);
  }

  deleteCapa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}InspectionCapa/DeleteCapa/${id}`);
  }

  getAllArchived(): Observable<any> {
    return this.http.get(this.apiUrl + "DataTable/get-all-archive");
  }

  deleteInspectionParameter(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}InspectionRef/DeleteParameter/${id}`);
  }

  getDefectStats(year: number, month: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionDefects/GetDefectStats/${year}/${month}`);
  }

  updateDefectsList(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionRef/UpdateDefectsList`, payload);
  }

  getDefectsList(inspectionRefId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionRef/GetDefectsByInspectionRefId/${inspectionRefId}`);
  }

  

  // Add this method to fetch stages (adjust the endpoint path if needed)
  getAllStages(): Observable<any> {
    return this.http.get(`${this.apiUrl}StageMaster/get-all`); 
  }

  // --- Analytics Dashboard APIs (Updated to accept stageId) ---

  getMonthlyErrorRates(year: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/monthly-error-rates/${year}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getDailyErrorRates(year: number, month: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/daily-error-rates/${year}/${month}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getHourlyErrorRates(year: number, month: number, day: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/hourly-error-rates/${year}/${month}/${day}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getShiftErrorRates(year: number, month: number, day: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/shift-error-rates/${year}/${month}/${day}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getMonthlyDefectCounts(year: number, month: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/monthly-defect-counts/${year}/${month}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getDailyDefectCounts(year: number, month: number, day: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/daily-defect-counts/${year}/${month}/${day}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getMonthlyPartFamilyCounts(year: number, month: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/monthly-part-family-counts/${year}/${month}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getDailyPartFamilyCounts(year: number, month: number, day: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/daily-part-family-counts/${year}/${month}/${day}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getTopDefectCounts(year: number, month: number, day?: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/top-defect-counts/${year}/${month}`;
    if (day) url += `/${day}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  getTopInspectorCounts(year: number, month: number, day?: number, stageId: number = 0): Observable<any> {
    let url = `${this.apiUrl}Analytics/top-inspector-counts/${year}/${month}`;
    if (day) url += `/${day}`;
    if (stageId > 0) url += `?stageId=${stageId}`;
    return this.http.get(url);
  }

  



  // --- NEW INSPECTION DOCUMENTS APIs ---

  uploadInspectionDocs(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl + "DataTable/upload-docs", data);
  }

  getInspectionDocs(inspectionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}DataTable/get-docs/${inspectionId}`);
  }

  deleteInspectionDoc(data: any): Observable<any> {
    return this.http.post(this.apiUrl + "DataTable/delete-doc", data);
  }


    // ==========================================
  // Shared Filter Settings API Calls
  // ==========================================
  saveUserFilters(payload: any) {
    // Uses the dedicated controller we created earlier!
    return this.http.post(this.apiUrl + 'UserFilterSettings/save-user-filters', payload);
  }

  getUserFilters(userId: number, screenName: string) {
    return this.http.get(this.apiUrl + `UserFilterSettings/get-user-filters?userId=${userId}&screenName=${screenName}`);
  }


}