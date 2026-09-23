import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from 'src/app/shared/alert.service';
// 🔥 Import your actual service here (Adjust the path if needed)
import { ProcessAuditService } from '../process-audit.service'; 

@Component({
  standalone: false,
  selector: 'app-paudits-help-desk',
  templateUrl: './paudits-help-desk.component.html',
  styleUrls: ['./paudits-help-desk.component.scss']
})
export class PauditsHelpDeskComponent implements OnInit {

  subject: string = '';
  description: string = '';
  isSending: boolean = false; 

  constructor(
    private dialogRef: MatDialogRef<PauditsHelpDeskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private api: ProcessAuditService, // 🔥 Inject your Service here instead of HttpClient
    private alertService: AlertService
  ) { }

  ngOnInit(): void { }

  close(): void {
    this.dialogRef.close();
  }

save(): void {
    if (!this.subject.trim()) {
      this.alertService.createAlert('Please enter a subject.', 0);
      return;
    }
    if (!this.description.trim()) {
      this.alertService.createAlert('Please enter a description.', 0);
      return;
    }

    this.isSending = true;

    // 🔥 THE FIX: We just read the exact keys from your login component!
    const storedUserId = localStorage.getItem('UserId');
    
    // Convert it to a number (parseInt) because localStorage always saves as strings
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0; 
    const currentUserType = localStorage.getItem('UserType') || 'Internal';

    // 2. Attach the dynamically found ID to the payload
    const payload = {
      userId: currentUserId,         
      userType: currentUserType,     
      subject: this.subject.trim(),
      description: this.description.trim(),
      moduleName: this.data?.module || 'Unknown Module'
    };

    // 3. Send the API request
    this.api.sendHelpDeskMail(payload).subscribe({
      next: (res: any) => {
        this.isSending = false;
        if (res.success) {
          this.alertService.createAlert(res.message, 1);
          this.dialogRef.close(true); 
        } else {
          this.alertService.createAlert(res.message || 'Failed to send mail', 0);
        }
      },
      error: (err: any) => {
        this.isSending = false;
        console.error(err);
        this.alertService.createAlert('Error connecting to server. Mail not sent.', 0);
      }
    });
  }
}