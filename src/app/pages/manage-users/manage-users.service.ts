import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageUsersService {

  // Base API URL
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ==========================================
  // ---------- ROLES API ENDPOINTS -----------
  // ==========================================

  getAllRoles() {
    return this.http.get(this.apiUrl + 'RoleMasters/get-all');
  }

  upsertRole(data: any) {
    return this.http.post(this.apiUrl + 'RoleMasters/upsert', data);
  }

  toggleStatus(data: any) {
    return this.http.post(this.apiUrl + 'RoleMasters/toggle-status', data);
  }

  deleteRole(data: any) {
    return this.http.post(this.apiUrl + 'RoleMasters/delete', data);
  }

  // ==========================================
  // ---------- USERS API ENDPOINTS -----------
  // ==========================================

  getAllUsers() {
    return this.http.get(this.apiUrl + 'Users/get-all');
  }

  upsertUser(data: any) {
    return this.http.post(this.apiUrl + 'Users/upsert', data);
  }

  toggleUserStatus(data: any) {
    return this.http.post(this.apiUrl + 'Users/toggle-status', data);
  }

  deleteUser(data: any) {
    return this.http.post(this.apiUrl + 'Users/delete', data);
  }

  getManagers() {
    return this.http.get(this.apiUrl + 'Users/get-managers');
  }

  resetPassword(data: any) {
    return this.http.post(this.apiUrl + 'Users/reset-password', data);
  }

  // ==========================================
  // ---------- AUTHENTICATION ----------------
  // ==========================================

  // login(credentials: any) {
  //   return this.http.post(this.apiUrl + 'Auth/login', credentials);
  // }

  // forgotPassword(email: string) {
  //   return this.http.post(this.apiUrl + 'Auth/forgot-password', { email: email });
  // }

  // resetPasswordWithToken(data: any) {
  //   return this.http.post(this.apiUrl + 'Auth/reset-password-with-token', data);
  // }

  login(credentials: any) {
    return this.http.post(this.apiUrl + 'Auth/login', credentials);
  }

  forgotPassword(email: string) {
    return this.http.post(this.apiUrl + 'Auth/forgot-password', { email: email });
  }

  resetPasswordWithToken(data: any) {
    return this.http.post(this.apiUrl + 'Auth/reset-password-with-token', data);
  }

  // 🔥 NEW MFA ENDPOINTS 🔥
  verifyMfaLogin(data: { code: string }) {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + 'Auth/verify-mfa-login', data, { headers });
  }

  verifyEmailOtp(data: { code: string }) {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + 'Auth/verify-email-otp', data, { headers });
  }

  sendEmailOtp() {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + 'Auth/send-email-otp', {}, { headers });
  }

  passkeyLoginOptions(email: string) {
    // Passkeys don't need a token because you aren't logged in yet
    return this.http.post(this.apiUrl + 'Auth/passkey-login-options', { email: email });
  }

  verifyPasskeyLogin(clientResponse: any, email: string) {
    return this.http.post(this.apiUrl + `Auth/verify-passkey-login?email=${email}`, clientResponse);
  }



  // 🔥 PASSKEY SETUP ENDPOINTS 🔥
  setupPasskeyOptions() {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + 'Mfa/setup-passkey-options', {}, { headers });
  }

  // setupPasskeyRegister(data: any) {
  //   const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   return this.http.post(this.apiUrl + 'Mfa/setup-passkey-register', data, { headers });
  // }

  // 🔥 UPDATED: Now accepts deviceName
  setupPasskeyRegister(data: any, deviceName: string) {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + `Mfa/setup-passkey-register?deviceName=${encodeURIComponent(deviceName)}`, data, { headers });
  }


  getPasskeyStatus() {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl + 'Mfa/passkey-status', { headers });
  }

  getPasskeyInfo() {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl + 'Mfa/passkey-info', { headers });
  }

  // deletePasskey() {
  //   const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   return this.http.post(this.apiUrl + 'Mfa/delete-passkey', {}, { headers });
  // }

  // 🔥 UPDATED: Now requires passkeyId to know which device to delete
  deletePasskey(passkeyId: number) {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + `Mfa/delete-passkey/${passkeyId}`, {}, { headers });
  }


  // 🔥 AUTHENTICATOR APP SETUP ENDPOINTS 🔥
  setupAuthenticator() {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + 'Mfa/setup-authenticator', {}, { headers });
  }

  verifyAuthenticator(data: { code: string }) {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl + 'Mfa/verify-authenticator', data, { headers });
  }

  // ==========================================
  // ---------- SUPPLIERS API ENDPOINTS -------
  // ==========================================

  getSuppliers() {
    return this.http.get(this.apiUrl + 'Suppliers/get-all');
  }

  upsertSupplier(data: any) {
    return this.http.post(this.apiUrl + 'Suppliers/upsert', data);
  }

  toggleSupplierStatus(id: number) {
    return this.http.post(this.apiUrl + `Suppliers/toggle-status/${id}`, {});
  }

  deleteSupplier(id: number) {
    return this.http.post(this.apiUrl + `Suppliers/delete/${id}`, {});
  }

  resetSupplierPassword(data: any) {
    return this.http.post(this.apiUrl + 'Suppliers/reset-password', data);
  }

  // ==========================================
  // ---------- LOCATION API ENDPOINTS --------
  // ==========================================

  getStates() {
    return this.http.get(this.apiUrl + 'StateMasters/get-all-states');
  }

  getCities() {
    return this.http.get(this.apiUrl + 'CityMasters/get-all-cities');
  }


  // Preference screen API endpoints
  getPreferences() {
    return this.http.get(this.apiUrl + 'Preference/get-preferences');
  }
  upsertPreference(data: any) { return this.http.post(this.apiUrl + 'Preference/upsert-preference', data); }
  getEscalation() {
    return this.http.get(this.apiUrl + 'Escalation/get-escalations');
  }
  upsertEscalation(data: any) { return this.http.post(this.apiUrl + 'Escalation/upsert-escalation', data); }


  // ==========================================
  // ----------Screen PERMISSIONS Api's ---------
  // ==========================================

  getRolePermissions(roleId: number) {
    return this.http.get(this.apiUrl + `RolePermissions/get-role-permissions?roleId=${roleId}`);
  }

  saveRolePermissions(payload: any) {
    return this.http.post(this.apiUrl + 'RolePermissions/save-role-permissions', payload);
  }

  // getUserLoginPermissions(roleId: number) {
  //   return this.http.get(this.apiUrl + `RolePermissions/get-user-login-permissions?roleId=${roleId}`);
  // }

  getUserLoginPermissions(roleId: any) { // <-- Change 'number' to 'any'
    // 🔥 THE GLOBAL FIX / CIRCUIT BREAKER
    if (roleId === 'Supplier') {
      return of({ success: true, data: [] });
    }

    return this.http.get(this.apiUrl + `RolePermissions/get-user-login-permissions?roleId=${roleId}`);
  }

  // ==========================================
  // ---------- HELP DESK API ENDPOINTS -------
  // ==========================================

  getHelpDeskNotifications(userId: number, userType: string) {
    return this.http.get<any>(`${this.apiUrl}HelpDesk/get-notifications?userId=${userId}&userType=${userType}`);
  }

  getSentMails(userId: number, userType: string) {
    return this.http.get<any>(`${this.apiUrl}HelpDesk/get-sent-mails?userId=${userId}&userType=${userType}`);
  }

  // ==========================================
  // ---------- ESCALATION AUTOMATION ---------
  // ==========================================

  triggerDailyEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-daily-escalations', {});
  }

  // ==========================================
  // DAILY ESCALATION SWEEPERS
  // ==========================================

  triggerProcessEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-daily-escalations', {});
  }

  triggerPartsEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-parts-escalations', {});
  }

  triggerInspectionEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-inspection-escalations', {});
  }

  // for eventLog 

  getEventLog(filter: any) { return this.http.get(this.apiUrl + 'Preference/get-event-log', { params: filter }); }




//   getInspectorNames() {
//   return this.http.get(this.apiUrl + 'Users/get-inspector-names');
// }

}