// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from 'src/environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class SetupService {
//   apiUrl = environment.apiUrl;

//   constructor(private http: HttpClient) { }

//   // States
//   getAllStates() { return this.http.get(this.apiUrl + 'State/get-all'); }
//   addState(data: any) { return this.http.post(this.apiUrl + 'State/upsert', data); }
//   upsertState(data: any) { return this.http.post(this.apiUrl + 'State/upsert', data); }
//   deleteState(data: any) { return this.http.post(this.apiUrl + 'State/delete', data); }
//   toggleStatus(data: any) { return this.http.post(this.apiUrl + 'State/toggle-status', data); }
//   toggleStateStatus(data: any) { return this.http.post(this.apiUrl + 'State/toggle-status', data); }

//   // Cities
//   getAllCities() { return this.http.get(this.apiUrl + 'City/get-all'); }
//   addCity(data: any) { return this.http.post(this.apiUrl + 'City/upsert', data); }
//   upsertCity(data: any) { return this.http.post(this.apiUrl + 'City/upsert', data); }
//   deleteCity(data: any) { return this.http.post(this.apiUrl + 'City/delete', data); }
//   toggleCity(data: any) { return this.http.post(this.apiUrl + 'City/toggle-status', data); }
//   toggleCityStatus(data: any) { return this.http.post(this.apiUrl + 'City/toggle-status', data); }

//   // Suppliers
//   getAllSuppliers() { return this.http.get(this.apiUrl + 'Supplier/get-all'); }
//   addSupplier(data: any) { return this.http.post(this.apiUrl + 'Supplier/upsert', data); }
//   upsertSupplier(data: any) { return this.http.post(this.apiUrl + 'Supplier/upsert', data); }
//   deleteSupplier(data: any) { return this.http.post(this.apiUrl + 'Supplier/delete', data); }
//   toggleSupplierStatus(data: any) { return this.http.post(this.apiUrl + 'Supplier/toggle-status', data); }

//   // Severities
//   getSeverities() { return this.http.get(this.apiUrl + 'Severity/get-all'); }
//   getSeverity() { return this.http.get(this.apiUrl + 'Severity/get-all'); }
//   upsertSeverity(data: any) { return this.http.post(this.apiUrl + 'Severity/upsert', data); }
//   toggleSeverityStatus(data: any) { return this.http.post(this.apiUrl + 'Severity/toggle-status', data); }
//   deleteSeverity(data: any) { return this.http.post(this.apiUrl + 'Severity/delete', data); }

//   // Occurrence
//   getOccurrence() { return this.http.get(this.apiUrl + 'Occurrence/get-all'); }
//   upsertOccurrence(data: any) { return this.http.post(this.apiUrl + 'Occurrence/upsert', data); }
//   deleteOccurrence(data: any) { return this.http.post(this.apiUrl + 'Occurrence/delete', data); }

//   // Detection
//   getDetection() { return this.http.get(this.apiUrl + 'Detection/get-all'); }
//   upsertDetection(data: any) { return this.http.post(this.apiUrl + 'Detection/upsert', data); }
//   deleteDetection(data: any) { return this.http.post(this.apiUrl + 'Detection/delete', data); }

//   // Demerit
//   getDemeritMaster(filter?: any) { return this.http.get(this.apiUrl + 'Demerit/get-all', { params: filter }); }
//   upsertDemeritMaster(data: any) { return this.http.post(this.apiUrl + 'Demerit/upsert', data); }

//   // Band Master
//   getBandMaster(filter?: any) { return this.http.get(this.apiUrl + 'Band/get-all', { params: filter }); }
//   upsertBandMaster(data: any) { return this.http.post(this.apiUrl + 'Band/upsert', data); }

//   // Defects
//   getDefects() { return this.http.get(this.apiUrl + 'Defect/get-all'); }
//   upsertDefect(data: any) { return this.http.post(this.apiUrl + 'Defect/upsert', data); }
//   deleteDefect(data: any) { return this.http.post(this.apiUrl + 'Defect/delete', data); }

//   // Parts Families
//   getPartFamilies(filter?: any) { return this.http.get(this.apiUrl + 'PartFamily/get-all', { params: filter }); }
//   upsertPartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/upsert', data); }
//   deletePartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/delete', data); }
//   changeStatusPartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/change-status', data); }

//   // Parts Master
//   getPartMaster(filter?: any) { return this.http.get(this.apiUrl + 'PartMaster/get-all', { params: filter }); }
//   upsertPartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/upsert', data); }
//   deletePartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/delete', data); }
//   changeStatusPartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/change-status', data); }

//   // Batch Master
//   getBatchMaster(filter?: any) { return this.http.get(this.apiUrl + 'BatchMaster/get-all', { params: filter }); }
//   upsertBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/upsert', data); }
//   deleteBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/delete', data); }
//   ChangeStatus(data: any) { return this.http.post(this.apiUrl + 'Setup/change-status', data); }

//   // Parameters
//   getParameters(filter?: any) { return this.http.get(this.apiUrl + 'Parameter/get-all', { params: filter }); }
//   upsertParameter(data: any) { return this.http.post(this.apiUrl + 'Parameter/upsert', data); }
//   deleteParameter(data: any) { return this.http.post(this.apiUrl + 'Parameter/delete', data); }

//   // Audit Categories
//   getPartAuditCategories(filter?: any) { return this.http.get(this.apiUrl + 'PartAuditCategory/get-all', { params: filter }); }
//   upsertPartAuditCategory(data: any) { return this.http.post(this.apiUrl + 'PartAuditCategory/upsert', data); }
//   deletePartAuditCategory(data: any) { return this.http.post(this.apiUrl + 'PartAuditCategory/delete', data); }
// }



import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // --- Existing State APIs ---
  getAllStates() { return this.http.get(this.apiUrl + 'StateMasters/get-all-states'); }
  addState(data: any) { return this.http.post(this.apiUrl + 'StateMasters/add-state', data); }
  toggleStatus(data: any) { return this.http.post(this.apiUrl + 'StateMasters/toggle-status', data); }
  deleteState(data: any) { return this.http.post(this.apiUrl + 'StateMasters/delete', data); }

  // --- Existing City APIs ---
  getAllCities() { return this.http.get(this.apiUrl + 'CityMasters/get-all-cities'); }
  addCity(data: any) { return this.http.post(this.apiUrl + 'CityMasters/add-city', data); }
  deleteCity(data: any) { return this.http.post(this.apiUrl + 'CityMasters/delete-city', data); }
  toggleCity(data: any) { return this.http.post(this.apiUrl + 'CityMasters/toggle-city', data); }

  // --- NEW: Supplier APIs ---
  getAllSuppliers() { return this.http.get(this.apiUrl + 'SupplierMaster/get-all-suppliers'); }
  addSupplier(data: any) { return this.http.post(this.apiUrl + 'SupplierMaster/add-supplier', data); }
  toggleSupplierStatus(data: any) { return this.http.post(this.apiUrl + 'SupplierMaster/toggle-status', data); }
  deleteSupplier(data: any) { return this.http.post(this.apiUrl + 'SupplierMaster/delete', data); }


  upsertPartAuditCategory(data: any) { return this.http.post(this.apiUrl + 'PartsAuditCategories/upsert', data); }
  getPartAuditCategories(filter: any) { return this.http.get(this.apiUrl + 'PartsAuditCategories/get-all', { params: filter }); }
  deletePartAuditCategory(data: any) { return this.http.post(this.apiUrl + 'PartsAuditCategories/delete', data); }
  ChangeStatus(data: any) { return this.http.post(this.apiUrl + 'PartsAuditCategories/toggle-status', data); }

  upsertPartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/upsert', data); }
  getPartFamilies(filter: any) { return this.http.get(this.apiUrl + 'PartFamily/get-all', { params: filter }); }
  deletePartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/delete', data); }
  changeStatusPartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/toggle-status', data); }

  updatePartFamilyDefects(data: any) { return this.http.post(this.apiUrl + 'PartFamily/update-defects', data); }
  // getAllSuppliers() {
  //   return this.http.get(this.apiUrl + 'SupplierMaster/get-all-suppliers'); // Verify prefix if controller uses [Route("api/[controller]")]
  // }

  // addSupplier(data: any) {
  //   return this.http.post(this.apiUrl + 'SupplierMaster/add-supplier', data);
  // }

  // toggleSupplierStatus(data: any) {
  //   return this.http.post(this.apiUrl + 'SupplierMaster/toggle-status', data);
  // }

  // deleteSupplier(data: any) {
  //   return this.http.post(this.apiUrl + 'SupplierMaster/delete', data);
  // }



  // upsertPartAuditCategory(data: any) {
  //   return this.http.post(this.apiUrl + 'PartsAuditCategories/upsert', data);
  // }
  // getPartAuditCategories(filter: any) {
  //   return this.http.get(this.apiUrl + 'PartsAuditCategories/get-all', {
  //     params: filter
  //   });
  // }
  // deletePartAuditCategory(data: any) {
  //   return this.http.post(this.apiUrl + 'PartsAuditCategories/delete', data);
  // }


  // ChangeStatus(data: any) {
  //   return this.http.post(this.apiUrl + 'PartsAuditCategories/toggle-status', data);
  // }

  // upsertPartFamily(data: any) {
  //   return this.http.post(this.apiUrl + 'PartFamily/upsert', data);
  // }
  // getPartFamilies(filter: any) {
  //   return this.http.get(this.apiUrl + 'PartFamily/get-all', {
  //     params: filter
  //   });
  // }
  // deletePartFamily(data: any) {
  //   return this.http.post(this.apiUrl + 'PartFamily/delete', data);
  // }


  // changeStatusPartFamily(data: any) {
  //   return this.http.post(this.apiUrl + 'PartFamily/toggle-status', data);
  // }
  upsertParameter(data: any) {
    return this.http.post(this.apiUrl + 'PartFamily/upsert-parameter', data);
  }
  getParameters(filter: any) {
    return this.http.get(this.apiUrl + 'PartFamily/get-parameters', {
      params: filter
    });
  }

  deleteParameter(data: any) {
    return this.http.post(this.apiUrl + 'PartFamily/delete-parameter', data);
  }

  upsertPartMaster(data: any) {
    return this.http.post(this.apiUrl + 'PartMaster/upsert', data);
  }

  getPartMaster(filter: any) {
    return this.http.get(this.apiUrl + 'PartMaster/get-all', {
      params: filter
    });
  }

  deletePartMaster(data: any) {
    return this.http.post(this.apiUrl + 'PartMaster/delete', data);
  }


  changeStatusPartMaster(data: any) {
    return this.http.post(this.apiUrl + 'PartMaster/toggle-status', data);
  }



  upsertBatchMaster(data: any) {
    return this.http.post(this.apiUrl + 'BatchMaster/upsert', data);
  }

  getBatchMaster(filter: any) {
    return this.http.get(this.apiUrl + 'BatchMaster/get-all', {
      params: filter
    });
  }

  deleteBatchMaster(data: any) {
    return this.http.post(this.apiUrl + 'BatchMaster/delete', data);
  }

  // upsertParameter(data: any) { return this.http.post(this.apiUrl + 'PartFamily/upsert-parameter', data); }
  // getParameters(filter: any) { return this.http.get(this.apiUrl + 'PartFamily/get-parameters', { params: filter }); }
  // deleteParameter(data: any) { return this.http.post(this.apiUrl + 'PartFamily/delete-parameter', data); }

  // upsertPartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/upsert', data); }
  // getPartMaster(filter: any) { return this.http.get(this.apiUrl + 'PartMaster/get-all', { params: filter }); }
  // deletePartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/delete', data); }
  // changeStatusPartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/toggle-status', data); }

  // upsertBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/upsert', data); }
  // getBatchMaster(filter: any) { return this.http.get(this.apiUrl + 'BatchMaster/get-all', { params: filter }); }
  // deleteBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/delete', data); }
  // changeStatusBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/toggle-status', data); }

  // --- Defects Master ---
  //Defects Master
  getDefects() { return this.http.get(this.apiUrl + 'Defects/get-all'); }
  upsertDefect(data: any) { return this.http.post(this.apiUrl + 'Defects/upsert', data); }
  deleteDefect(data: any) { return this.http.post(this.apiUrl + 'Defects/delete', data); }


  //Severity Master
  getSeverities() { return this.http.get(this.apiUrl + 'Severity/get-all'); }
  upsertSeverity(data: any) { return this.http.post(this.apiUrl + 'Severity/upsert', data); }
  toggleSeverityStatus(data: any) { return this.http.post(this.apiUrl + 'Severity/toggle-status', data); }
  deleteSeverity(data: any) { return this.http.post(this.apiUrl + 'Severity/delete', data); }

  upsertBandMaster(data: any) {
    return this.http.post(this.apiUrl + 'BatchMaster/upsert-band-master', data);
  }

  getBandMaster(filter: any) {
    return this.http.get(this.apiUrl + 'BatchMaster/get-band-master', {
      params: filter
    });
  }
  upsertDemeritMaster(data: any) {
    return this.http.post(this.apiUrl + 'BatchMaster/upsert-demerit-master', data);
  }

  getDemeritMaster(filter: any) {
    return this.http.get(this.apiUrl + 'BatchMaster/get-demerit-master', {
      params: filter
    });
  }

  getOccurrence() {
    return this.http.get(this.apiUrl + 'Occurrence/get-occurrences');
  }
  upsertOccurrence(data: any) { return this.http.post(this.apiUrl + 'Occurrence/upsert-occurrence', data); }
  getDetection() {
    return this.http.get(this.apiUrl + 'Occurrence/get-detections');
  }
  upsertDetection(data: any) { return this.http.post(this.apiUrl + 'Occurrence/upsert-detection', data); }


}
