import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';

interface Notification {
  id: number;
  auditType: 'Process Audit' | 'Parts Audit' | 'Help Desk' | 'System Escalation';
  date: string;
  commodity: string;
  category: string;
  issue?: string;
  partFamily?: string;
  parameter?: string;
  sender?: string;
  moduleName?: string;
  severity: 'Critical' | 'Important' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-user-notification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './user-notification.component.html',
  styleUrls: ['./user-notification.component.scss']
})
export class UserNotificationComponent implements OnInit {

  @ViewChild('notificationMenuTrigger') notificationMenuTrigger!: MatMenuTrigger;

  notifications: Notification[] = [];

  constructor(
    private api: ManageUsersService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications() {
    const currentUserId = this.api.getUserId ? this.api.getUserId() : (parseInt(localStorage.getItem('UserId') || '0', 10));
    const currentUserType = localStorage.getItem('UserType') || 'Internal';

    this.api.getHelpDeskNotifications(currentUserId, currentUserType).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const liveTickets: Notification[] = res.data.map((log: any) => {
            return {
              id: log.ticketId,
              auditType: log.moduleName === 'System Escalation' ? 'System Escalation' : 'Help Desk',
              date: new Date(log.createdDate).toLocaleDateString(),
              commodity: 'System',
              category: 'Support',
              sender: log.userName,
              moduleName: log.moduleName,
              issue: log.subject,
              severity: 'Medium'
            };
          });

          liveTickets.sort((a, b) => b.id - a.id);

          this.notifications = liveTickets;
          this.cdr.markForCheck();
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  clearNotifications(): void {
    this.notifications = [];
    this.cdr.markForCheck();
  }

  closeNotificationMenu(): void {
    if (this.notificationMenuTrigger) {
      this.notificationMenuTrigger.closeMenu();
    }
  }

  openNotification(notification?: Notification): void {
    this.closeNotificationMenu();
    if (notification && notification.id) {
      this.router.navigate(['/notifications'], { queryParams: { id: notification.id } });
    } else {
      this.router.navigate(['/notifications']);
    }
  }

  getCriticalCount(): number {
    return this.notifications.filter(n => n.severity === 'Critical').length;
  }

  getProcessAuditCount(): number {
    return this.notifications.filter(n => n.auditType === 'Process Audit').length;
  }

  getPartsAuditCount(): number {
    return this.notifications.filter(n => n.auditType === 'Parts Audit').length;
  }

  getNotificationsBySeverity(severity: string): Notification[] {
    return this.notifications.filter(n => n.severity === severity);
  }

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getNotificationSummary(notification: Notification): string {
    if (notification.auditType === 'Help Desk') {
      return `From: ${notification.sender} (${notification.moduleName}) - ${notification.issue}`;
    }
    if (notification.auditType === 'System Escalation') {
      return `[${notification.moduleName || 'System'}] ${notification.issue || 'Escalation alert'}`;
    }

    const parts: string[] = [
      `Commodity - ${notification.commodity}`,
      `Category - ${notification.category}`
    ];

    if (notification.auditType === 'Process Audit') {
      parts.push(notification.issue || '');
    } else {
      parts.push(`${notification.partFamily} - ${notification.parameter}`);
    }

    parts.push(`Severity - ${notification.severity}`);

    return parts.join(', ');
  }
}
