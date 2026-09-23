import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { jwtDecode } from 'jwt-decode';
import { ManageUsersService } from '../manage-users/manage-users.service';
import { emailValidator } from '../../theme/utils/app-validators';
import { AlertService } from '../../shared/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public passwordType: string = 'password';

  // 🔥 NEW: Flow State Variables
  public loginStep: 'email' | 'password' = 'email';
  public isCheckingPasskey: boolean = false;

  // MFA UI State
  public step: 'login' | 'mfa-choice' | 'mfa-auth' | 'mfa-email' = 'login';
  public mfaCode: string = '';
  public isSendingOtp: boolean = false;



  public togglePassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      'email': [null, Validators.compose([Validators.required, emailValidator])],

      // Note: We remove the 'required' validator temporarily so the 'Continue' button works for just the email.
      // We will check password validity manually later!
      'password': [null]
    });
  }

  ngOnInit() { }

  // ==========================================================
  // 🔥 NEW: STEP 1 - EMAIL & SMART PASSKEY DETECTION
  // ==========================================================
  public checkEmailAndPasskey() {
    if (this.form.get('email')?.invalid) {
      this.form.get('email')?.markAsTouched();
      return;
    }

    const email = this.form.get('email')?.value;
    this.isCheckingPasskey = true;

    // Ask the backend: Does this user have a Passkey?
    this.api.passkeyLoginOptions(email).subscribe({
      next: async (options: any) => {
        this.isCheckingPasskey = false;

        try {
          // 1. Passkey exists! Convert options for the scanner
          options.challenge = this.base64urlToBuffer(options.challenge);
          if (options.allowCredentials) {
            options.allowCredentials = options.allowCredentials.map((c: any) => {
              c.id = this.base64urlToBuffer(c.id);
              return c;
            });
          }

          // 2. Wake up the Fingerprint / Windows Hello scanner automatically
          const assertion = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential;

          if (!assertion) {
            // User hit "Cancel" on the fingerprint prompt. Fall back to password.
            this.loginStep = 'password';
            return;
          }

          // 3. Scanner success! Format the signature
          const response = assertion.response as AuthenticatorAssertionResponse;
          const clientResponse = {
            id: assertion.id,
            rawId: this.bufferToBase64url(assertion.rawId),
            type: assertion.type,

            // 🔥 FIX 1: C# strictly requires this exact property name for Login
            clientExtensionResults: assertion.getClientExtensionResults(),

            response: {
              authenticatorData: this.bufferToBase64url(response.authenticatorData),

              // 🔥 FIX 2: Must be lowercase 'son' to match the C# Model
              clientDataJson: this.bufferToBase64url(response.clientDataJSON),

              signature: this.bufferToBase64url(response.signature),
              userHandle: response.userHandle ? this.bufferToBase64url(response.userHandle) : null
            }
          };

          // 4. Verify with C# Backend
          this.api.verifyPasskeyLogin(clientResponse, email).subscribe({
            next: (res: any) => {
              if (res.success) this.processSuccessfulLogin(res);
            },
            error: (err: any) => {
              this.alertService.createAlert(err.error?.message || 'Passkey failed. Please use password.', 0);
              this.loginStep = 'password'; // Fallback to password on error
            }
          });

        } catch (err) {
          // If biometric hardware fails or user aborts, gracefully fall back to password
          this.loginStep = 'password';
        }
      },
      error: () => {
        // No Passkey found for this email (or API error). Move cleanly to Step 2!
        this.isCheckingPasskey = false;
        this.loginStep = 'password';
      }
    });
  }

  // ==========================================================
  // STEP 2: STANDARD LOGIN (If no Passkey, or Passkey cancelled)
  // ==========================================================
  public onSubmit(values: any) {
    // Manually enforce password rules since we hid it in Step 1
    if (!values.password || values.password.length < 6) {
      this.alertService.createAlert('Password must be at least 6 characters.', 0);
      return;
    }

    const credentials = {
      email: values.email,
      password: values.password
    };

    this.api.login(credentials).subscribe({
      next: (res: any) => {
        if (res.success) {
          if (res.requiresMfa) {
            localStorage.setItem('jwt_token', res.token);
            sessionStorage.setItem('jwt_token', res.token);

            if (res.isEmailEnabled && !res.isAuthEnabled) {
              this.chooseEmailOtp();
            } else if (res.isAuthEnabled && !res.isEmailEnabled) {
              this.step = 'mfa-auth';
            } else {
              this.step = 'mfa-choice';
            }
          } else {
            this.processSuccessfulLogin(res);
          }
        }
      },
      error: (err) => {
        this.alertService.createAlert(err.error?.message || 'Invalid Email or Password', 0);
      }
    });
  }

  // ==========================================================
  // MFA FLOW METHODS
  // ==========================================================
  public chooseAuthenticator() { this.step = 'mfa-auth'; }

  public chooseEmailOtp() {
    this.isSendingOtp = true;
    this.api.sendEmailOtp().subscribe({
      next: (res: any) => {
        this.isSendingOtp = false;
        if (res.success) {
          this.step = 'mfa-email';
          this.alertService.createAlert('A 6-digit code has been sent to your email.', 1);
        }
      },
      error: () => {
        this.isSendingOtp = false;
        this.alertService.createAlert('Failed to send email OTP', 0);
      }
    });
  }

  public submitMfaCode() {
    if (!this.mfaCode || this.mfaCode.length < 6) return;

    const request = this.step === 'mfa-email'
      ? this.api.verifyEmailOtp({ code: this.mfaCode })
      : this.api.verifyMfaLogin({ code: this.mfaCode });

    request.subscribe({
      next: (res: any) => {
        if (res.success) this.processSuccessfulLogin(res);
      },
      error: (err) => {
        this.alertService.createAlert(err.error?.message || 'Invalid verification code', 0);
      }
    });
  }

  public cancelMfa() {
    this.step = 'login';
    this.loginStep = 'password';
    this.mfaCode = '';
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
  }

  public goBackToChoice() {
    this.step = 'mfa-choice';
    this.mfaCode = '';
  }



  private processSuccessfulLogin(res: any) {
    // 1. Save the secure token
    localStorage.setItem('jwt_token', res.token);
    sessionStorage.setItem('jwt_token', res.token);

    // 2. Decode the token
    // const decodedToken: any = jwtDecode(res.token);
    // 2. Decode the token
    const decodedToken: any = jwtDecode(res.token);
    console.log('DECODED TOKEN:', decodedToken); // 🔍 TEMPORARY — remove after checking  

    // 3. Grab the UserName safely (checking both upper and lower case)
    // const userName = decodedToken.UserName || decodedToken.userName || decodedToken.name || 'User'; 
    // localStorage.setItem('UserName', userName); 

    // 🔥 NOTICE: We are NOT setting UserId, RoleId, or UserType in Local Storage anymore!

    this.setGridLength();

    // 4. Grab RoleId from the token just to fetch the UI permissions
    const roleId = decodedToken.RoleId || decodedToken.roleId;

    this.api.getUserLoginPermissions(roleId).subscribe({
      next: (permRes: any) => {
        if (permRes.success || permRes.Success) {
          // We KEEP rolePermissions so Angular knows to show/hide the Delete buttons
          localStorage.setItem('rolePermissions', JSON.stringify(permRes.data || permRes.Data));
        }
        this.alertService.createAlert('Login Successful', 1);

        const userType = decodedToken.UserType || decodedToken.userType;
        this.navigateUser(userType);
      },
      error: () => {
        this.alertService.createAlert('Login Successful', 1);

        const userType = decodedToken.UserType || decodedToken.userType;
        this.navigateUser(userType);
      }
    });
  }

  private navigateUser(userType: string) {
    if (userType === 'Supplier') {
      this.router.navigate(['/app/supplier-login/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // --- WebAuthn Base64 Helpers ---
  private base64urlToBuffer(base64url: string): ArrayBuffer {
    const padding = '==='.slice((base64url.length + 3) % 4);
    const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  private bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const charCode of bytes) {
      str += String.fromCharCode(charCode);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private setGridLength(): void {
    this.api.getPreferences().subscribe({
      next: (res: any) => {
        if (res.success) {
          const preferences = res.data || [];
          const gridPreference = preferences.find(
            (item: any) => item.subject?.trim().toLowerCase() === 'grid length'
          );
          if (gridPreference) {
            const gridLength = gridPreference.newValue?.toString().trim() || gridPreference.previousValue?.toString().trim();
            if (gridLength) localStorage.setItem('GridLength', gridLength);
          }
        }
      }
    });
  }
} 