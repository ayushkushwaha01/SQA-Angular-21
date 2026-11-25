import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { BehaviorSubject, Observable, of, tap, finalize, shareReplay } from 'rxjs';
import { BehaviorSubject, Observable, of, tap, finalize, shareReplay, catchError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageUsersService {

  apiUrl = environment.apiUrl;

  public readonly sentMailsCount$ = new BehaviorSubject<number>(0);
  public readonly cachedSentMails$ = new BehaviorSubject<any[] | null>(null);
  private inFlightSentMails$: Observable<any> | null = null;

  constructor(private http: HttpClient) { }

  getUserId(): number {
    const localId = Number(localStorage.getItem('UserId'));
    if (localId > 0) return localId;
    const token = sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
          || decoded.nameid
          || decoded.UserId
          || decoded.userId
          || decoded.sub;
        if (id && Number(id) > 0) return Number(id);
      } catch (e) {}
    }
    return 0;
  }

  // fetchSentMails(userId?: number, userType?: string, forceRefresh: boolean = false): Observable<any> {
  //   if (!forceRefresh && this.inFlightSentMails$) {
  //     return this.inFlightSentMails$;
  //   }
  //   const uid = userId ?? this.getUserId();
  //   const ut = userType ?? (localStorage.getItem('UserType') || 'Internal');
  //   this.inFlightSentMails$ = this.getSentMails(uid, ut).pipe(
  //     tap({
  //       next: (res: any) => {
  //         if (res && res.success && Array.isArray(res.data)) {
  //           const filtered = res.data.filter((m: any) => m && m.moduleName !== 'System Escalation');
  //           this.sentMailsCount$.next(filtered.length);
  //           this.cachedSentMails$.next(filtered);
  //         } else {
  //           this.sentMailsCount$.next(0);
  //           this.cachedSentMails$.next([]);
  //         }
  //       },
  //       error: () => {
  //         this.sentMailsCount$.next(0);
  //         this.cachedSentMails$.next([]);
  //       }
  //     }),
  //     finalize(() => {
  //       this.inFlightSentMails$ = null;
  //     }),
  //     shareReplay(1)
  //   );
  //   return this.inFlightSentMails$;
  // }

  // refreshSentMailsCount(userId?: number, userType?: string, forceRefresh: boolean = false): void {
  //   this.fetchSentMails(userId, userType, forceRefresh).subscribe();
  // }


    private lastSentMailsFetch = 0;

  fetchSentMails(userId?: number, userType?: string, forceRefresh: boolean = false): Observable<any> {
    if (!forceRefresh && this.inFlightSentMails$) {
      return this.inFlightSentMails$;
    }
    const uid = userId ?? this.getUserId();
    const ut = userType ?? (localStorage.getItem('UserType') || 'Internal');

    // new light endpoint; falls back to the old one if it is not deployed yet
    this.inFlightSentMails$ = this.getSentMailsSummary().pipe(
      catchError(() => this.getSentMails(uid, ut)),
      tap({
        next: (res: any) => {
          if (res && res.success && Array.isArray(res.data)) {
            const filtered = res.data.filter((m: any) => m && m.moduleName !== 'System Escalation');
            this.sentMailsCount$.next(res.total ?? filtered.length);
            this.cachedSentMails$.next(filtered);
          } else {
            this.sentMailsCount$.next(0);
            this.cachedSentMails$.next([]);
          }
        },
        error: () => {
          this.sentMailsCount$.next(0);
          this.cachedSentMails$.next([]);
        }
      }),
      finalize(() => {
        this.inFlightSentMails$ = null;
      }),
      shareReplay(1)
    );
    return this.inFlightSentMails$;
  }

  // The header calls this on every route change, tab focus and storage event.
  // Skip it if we refreshed in the last 60 seconds, unless forced.
  refreshSentMailsCount(userId?: number, userType?: string, forceRefresh: boolean = false): void {
    const now = Date.now();
    if (!forceRefresh && now - this.lastSentMailsFetch < 60000) return;
    this.lastSentMailsFetch = now;
    this.fetchSentMails(userId, userType, forceRefresh).subscribe();
  }

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


  // Add these to your ManageUsersService
getMailToggleStatus() {
  return this.http.get(`${this.apiUrl}CapaEscalation/get-mail-toggle-status`);
}

toggleMailService(isEnabled: boolean) {
  return this.http.post(`${this.apiUrl}CapaEscalation/toggle-mail-service?isEnabled=${isEnabled}`, {});
}


//optimization
  getSentMailsSummary(take: number = 100) {
    return this.http.get<any>(`${this.apiUrl}HelpDesk/get-sent-mails-summary?take=${take}`);
  }
}