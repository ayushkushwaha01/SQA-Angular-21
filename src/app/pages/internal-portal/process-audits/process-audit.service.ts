import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ProcessAuditService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Process Audit CRUD
  getAllAudits() { return this.http.get(this.apiUrl + 'ProcessAudits/get-all'); }
  upsertAudit(data: any) { return this.http.post(this.apiUrl + 'ProcessAudits/upsert', data); }
  deleteAudit(data: any) { return this.http.post(this.apiUrl + 'ProcessAudits/delete', data); }

  // Helper APIs for Dropdowns
  getLookups() { return this.http.get(this.apiUrl + 'Lookup/get-lookups'); }
  getCommodities() { return this.http.get(this.apiUrl + 'Commodity/get-commodities'); }
  getUsers() { return this.http.get(this.apiUrl + 'Users/get-all'); } // To filter Auditors

  // --- Inner Screen APIs ---
  getProcessCategories() { return this.http.get(this.apiUrl + 'ProcessAudit/get-categories'); }
  getChecklists(categoryId: number) { return this.http.get(this.apiUrl + 'ProcessAudit/get-checklists/' + categoryId); }
  getSeverities() { return this.http.get(this.apiUrl + 'Severity/get-all'); }

  // --- Inner Screen APIs ---
  getInnerScreenDetails(auditId: number, checklistId: number) {
    return this.http.get(this.apiUrl + `ProcessAuditInnerScreen/get-response?processAuditId=${auditId}&checklistId=${checklistId}`);
  }

  // 🔥 ADD THIS MISSING METHOD to save the form data
  saveInnerScreenDetails(formData: FormData) {
    return this.http.post(this.apiUrl + 'ProcessAuditInnerScreen/save-checklist-response', formData);
  }




  //CAPA Grid Main Menu-Item APIs
  getAllCapas() { return this.http.get(this.apiUrl + 'ProcessAuditInnerScreen/get-all-capas'); }
  updateCapaStatus(payload: any) { return this.http.post(this.apiUrl + 'ProcessAuditInnerScreen/update-capa-status', payload); }
  deleteCapa(payload: any) {
    return this.http.post(this.apiUrl + 'ProcessAuditInnerScreen/delete-capa', payload);
  }


  //document dellete

  deleteInnerScreenDocument(payload: any) {
    return this.http.post(this.apiUrl + 'ProcessAuditInnerScreen/delete-document', payload);
  }


  //supplier related APIs 

  // Update these two methods in your process-audit.service.ts
  getAllAuditsSupplier(supplierId?: number) {
    let url = this.apiUrl + 'ProcessAudits/get-all';
    if (supplierId) {
      url += `?supplierId=${supplierId}`;
    }
    return this.http.get(url);
  }

  getAllCapasSupplie(supplierId?: number) {
    let url = this.apiUrl + 'ProcessAuditInnerScreen/get-all-capas';
    if (supplierId) {
      url += `?supplierId=${supplierId}`;
    }
    return this.http.get(url);
  }


  // Add inside ProcessAuditService class
  getAuditSummaryReport(processAuditId: number): Observable<any> {
    return this.http.get(this.apiUrl + `ProcessAudits/get-audit-summary-report?processAuditId=${processAuditId}`);
  }

  getAllResponsesForAudit(auditId: number) {
    return this.http.get(`${this.apiUrl}/ProcessAuditInnerScreen/get-all-responses-for-audit?processAuditId=${auditId}`);
  }

  //Help Desk APIs
  sendHelpDeskMail(payload: any) {
    // No headers needed, just pass the payload directly!
    return this.http.post<any>(`${this.apiUrl}HelpDesk/send`, payload);
  }


  //Related to post features of notifications and the mails of esclations

  getEscalations() { return this.http.get(this.apiUrl + 'Escalation/get-escalations'); } // 🔥 Add this line

  // ==========================================
  // ---------- ESCALATION AUTOMATION ---------
  // ==========================================

  triggerDailyEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-daily-escalations', {});
  }


  getOccurrences() {
    return this.http.get(this.apiUrl + 'Occurrence/get-occurrences');
  }

  getDetections() {
    return this.http.get(this.apiUrl + 'Occurrence/get-detections');
  }
}