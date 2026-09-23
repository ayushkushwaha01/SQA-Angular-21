import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProcessAuditService {
  apiUrl = environment.apiUrl + 'ProcessAudit/';

  constructor(private http: HttpClient) { }

   // ---------- PROCESS CATEGORIES ------------
   
  getCategories() { 
    return this.http.get(this.apiUrl + 'get-categories'); 
  }
  
  upsertCategory(data: any) { 
    return this.http.post(this.apiUrl + 'upsert-category', data); 
  }

  toggleCategoryStatus(categoryId: number) { 
    // Passes the ID in the URL to match the .NET Controller route
    return this.http.post(this.apiUrl + 'toggle-category-status/' + categoryId, {}); 
  }
  
  deleteCategory(categoryId: number) { 
    return this.http.post(this.apiUrl + 'delete-category/' + categoryId, {}); 
  }


   // ---------- CHECKLISTS (QUESTIONS) --------
 

  getChecklists(categoryId: number) { 
    return this.http.get(this.apiUrl + 'get-checklists/' + categoryId); 
  }
  
  upsertChecklist(data: any) { 
    return this.http.post(this.apiUrl + 'upsert-checklist', data); 
  }

  deleteChecklist(checklistId: number) { 
    return this.http.post(this.apiUrl + 'delete-checklist/' + checklistId, {}); 
  }

    // ---------- GUIDELINES ------------
}