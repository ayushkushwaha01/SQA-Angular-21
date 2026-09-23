
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ManageUsersService } from '../../manage-users/manage-users.service';
import { AlertService } from '../../../shared/alert.service';

@Component({
  selector: 'app-passkey-manage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './passkey-manage-dialog.component.html',
  styleUrl: './passkey-manage-dialog.component.scss'
})
export class PasskeyManageDialogComponent implements OnInit {
  
  public hasPasskey: boolean = false;
  public passkeysList: any[] = [];
  public isLoading: boolean = true;
  
  // Toggle for the naming screen
  public isAddingNew: boolean = false;
  public newDeviceName: string = '';

  constructor(
    public dialogRef: MatDialogRef<PasskeyManageDialogComponent>,
    private api: ManageUsersService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadPasskeyInfo();
  }

  loadPasskeyInfo() {
    this.isLoading = true;
    this.api.getPasskeyInfo().subscribe({
      next: (res: any) => {
        this.hasPasskey = res.hasPasskey;
        this.passkeysList = res.passkeysList || []; // Maps to our C# backend list!
        this.isLoading = false;
        this.isAddingNew = false; // Reset view
        this.newDeviceName = '';
      },
      error: () => this.isLoading = false
    });
  }

  deletePasskey(passkeyId: number) {
    if(confirm("Are you sure you want to remove this device?")) {
      this.api.deletePasskey(passkeyId).subscribe({
        next: (res: any) => {
          this.alertService.createAlert(res.message, 1);
          this.loadPasskeyInfo(); // Refresh the list
        }
      });
    }
  }

  startAddNewDevice() {
    this.isAddingNew = true;
  }

  public executePasskeyRegistration() {
    if (!this.newDeviceName.trim()) {
      this.alertService.createAlert('Please enter a device name.', 0);
      return;
    }

    this.api.setupPasskeyOptions().subscribe({
      next: async (options: any) => {
        try {
          options.challenge = this.base64urlToBuffer(options.challenge);
          options.user.id = this.base64urlToBuffer(options.user.id);
          
          if (options.excludeCredentials) {
            options.excludeCredentials = options.excludeCredentials.map((c: any) => {
              c.id = this.base64urlToBuffer(c.id);
              return c;
            });
          }

          const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
          const responseObj = credential.response as AuthenticatorAttestationResponse;

          const attestationResponse = {
            id: credential.id,
            rawId: this.bufferToBase64url(credential.rawId),
            type: credential.type,
            extensions: credential.getClientExtensionResults(), 
            response: {
              attestationObject: this.bufferToBase64url(responseObj.attestationObject),
              clientDataJson: this.bufferToBase64url(responseObj.clientDataJSON),
              transports: (responseObj as any).getTransports ? (responseObj as any).getTransports() : ['internal']
            }
          };

          // 🔥 Pass the typed device name to the backend!
          this.api.setupPasskeyRegister(attestationResponse, this.newDeviceName).subscribe({
             next: (res: any) => {
               this.alertService.createAlert(res.message, 1);
               this.loadPasskeyInfo(); // Go back to list and refresh!
             },
             error: (err: any) => this.alertService.createAlert(err.error?.message || 'Passkey setup failed', 0)
          });
        } catch (err) {
           this.alertService.createAlert('Biometric scan cancelled or failed.', 0);
        }
      }
    });
  }

  private base64urlToBuffer(base64url: string): ArrayBuffer {
    const padding = '==='.slice((base64url.length + 3) % 4);
    const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
    return outputArray.buffer;
  }

  private bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const charCode of bytes) { str += String.fromCharCode(charCode); }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}