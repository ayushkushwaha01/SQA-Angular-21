import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }



  // getAllDepartments(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/get-all`);
  // }

  // addUpdateDepartment(data: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/add-department`, data);
  // }

  // toggleDepartmentStatus(data: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/toggle-department`, data);
  // }


  getAllDepartments() {
    return this.http.get(this.apiUrl + 'DepartmentMasters/get-all'); // Verify prefix if controller uses [Route("api/[controller]")]
  }

  addUpdateDepartment(data: any) {
    return this.http.post(this.apiUrl + 'DepartmentMasters/add-department', data);
  }

  toggleDepartmentStatus(data: any) {
    return this.http.post(this.apiUrl + 'DepartmentMasters/toggle-department', data);
  }


  deleteDepartment(data: any) {
    return this.http.post(this.apiUrl + 'DepartmentMasters/delete', data);
  }
  // deleteSupplier(data: any) {
  //   return this.http.post(this.apiUrl + 'SupplierMaster/delete', data);
  // }
}
