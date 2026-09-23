import { Component, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ManageUsersService } from '../../manage-users/manage-users.service';

@Component({
  selector: 'app-sent-mails-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sent-mails-dialog.component.html',
  styleUrl: './sent-mails-dialog.component.scss'
})
export class SentMailsDialogComponent implements OnInit {
  sentMails: any[] = [];
  isLoading: boolean = true;
  searchQuery: string = '';
  selectedMail: any = null;

  constructor(
    @Optional() public dialogRef: MatDialogRef<SentMailsDialogComponent>,
    private api: ManageUsersService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    const userId = parseInt(localStorage.getItem('UserId') || '0', 10);
    const userType = localStorage.getItem('UserType') || 'Internal';

    // Fetch the sent emails for this specific user
    this.api.getSentMails(userId, userType).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // 🔥 Filter out System Escalations so ONLY user-sent Help Desk emails appear in Sent Mails
          this.sentMails = res.data.filter((m: any) => m.moduleName !== 'System Escalation');
          if (this.sentMails.length > 0 && !this.selectedMail) {
            this.selectedMail = this.sentMails[0];
          }
        } else {
          this.sentMails = [];
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching sent mails', err);
        this.isLoading = false;
      }
    });
  }

  selectMail(mail: any): void {
    this.selectedMail = mail;
  }

  get filteredMails(): any[] {
    const list = this.sentMails.filter(m => m.moduleName !== 'System Escalation');
    if (!this.searchQuery.trim()) {
      return list;
    }
    const q = this.searchQuery.toLowerCase();
    return list.filter(m => 
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.moduleName && m.moduleName.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
    );
  }

  goBack(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      if (window.history.length > 1) {
        this.location.back();
      } else {
        this.router.navigate(['/app/sqm']);
      }
    }
  }

  close() {
    this.goBack();
  }
}