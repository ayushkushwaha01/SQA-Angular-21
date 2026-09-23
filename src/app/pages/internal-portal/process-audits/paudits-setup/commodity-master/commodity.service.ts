import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CommodityService {
  apiUrl = environment.apiUrl + 'Commodity/';

  constructor(private http: HttpClient) { }

  getCommodities() { return this.http.get(this.apiUrl + 'get-commodities'); }
  upsertCommodity(data: any) { return this.http.post(this.apiUrl + 'upsert-commodity', data); }
  toggleCommodityStatus(id: number) { return this.http.post(this.apiUrl + 'toggle-commodity-status/' + id, {}); }
  deleteCommodity(id: number) { return this.http.post(this.apiUrl + 'delete-commodity/' + id, {}); }

  getTargets(commodityId: number) { return this.http.get(this.apiUrl + 'get-targets/' + commodityId); }
  upsertTarget(data: any) { return this.http.post(this.apiUrl + 'upsert-target', data); }
  deleteTarget(id: number) { return this.http.post(this.apiUrl + 'delete-target/' + id, {}); }
}