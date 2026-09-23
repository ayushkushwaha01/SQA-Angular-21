import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class LookupMasterService {
  apiUrl = environment.apiUrl + 'Lookup/';

  constructor(private http: HttpClient) { }

  getCodeMasters() { return this.http.get(this.apiUrl + 'get-code-masters'); }
  getLookups() { return this.http.get(this.apiUrl + 'get-lookups'); }
  upsertLookup(data: any) { return this.http.post(this.apiUrl + 'upsert-lookup', data); }
  toggleStatus(id: number) { return this.http.post(this.apiUrl + 'toggle-status/' + id, {}); }
  deleteLookup(id: number) { return this.http.post(this.apiUrl + 'delete/' + id, {}); }
}