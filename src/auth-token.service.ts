import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {

  public getToken(): string | null {
    return sessionStorage.getItem('jwt_token');
  }

  public getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }

  public getUserId(): number {
    const decoded = this.getDecodedToken();
    if (!decoded) return 0;
    // .NET maps NameIdentifier to this long schema URL by default
    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid;
    return parseInt(userId, 10);
  }

  public getRoleId(): number {
    const decoded = this.getDecodedToken();
    if (!decoded) return 0;
    return parseInt(decoded.RoleId, 10);
  }

  public getUserType(): string {
    const decoded = this.getDecodedToken();
    return decoded ? (decoded.UserType || decoded.userType || '') : '';
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.getDecodedToken();
    if (!decoded) return false;
    if (decoded.exp) {
      const isExpired = Date.now() >= decoded.exp * 1000;
      if (isExpired) {
        this.clearToken();
        return false;
      }
    }
    return true;
  }

  public clearToken(): void {
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
  }
}