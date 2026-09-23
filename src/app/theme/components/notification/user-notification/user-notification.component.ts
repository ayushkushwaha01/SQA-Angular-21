
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';

// interface Notification {
//   id: number;
//   auditType: 'Process Audit' | 'Parts Audit' | 'Help Desk';
//   date: string;
//   commodity: string;
//   category: string;
//   issue?: string;
//   partFamily?: string;
//   parameter?: string;
//   sender?: string;
//   moduleName?: string;
//   severity: 'Critical' | 'Important' | 'Medium' | 'Low';
// }

interface Notification {
  id: number;
  // 🔥 Add 'System Escalation' here
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
  templateUrl: './user-notification.component.html',
  styleUrls: ['./user-notification.component.scss']
})
export class UserNotificationComponent implements OnInit {

  @ViewChild('notificationMenuTrigger') notificationMenuTrigger!: MatMenuTrigger;

  notifications: Notification[] = [];

  constructor(private api: ManageUsersService) { }

  ngOnInit(): void {
    this.fetchNotifications();
  }

// fetchNotifications() { 
//     // 1. Get the current user from Local Storage
//     const storedUserId = localStorage.getItem('UserId');
//     const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;
//     const currentUserType = localStorage.getItem('UserType') || 'Internal';

//     // If no user is logged in, don't fetch anything
//     if (currentUserId === 0) return;

//     // 2. Pass the arguments into the service call
//     this.api.getHelpDeskNotifications(currentUserId, currentUserType).subscribe({
//       next: (res: any) => {
//         // 🔥 THE FIX: We actually map the data and push it into the notifications array!
//         if (res.success && res.data) {
//           const liveTickets: Notification[] = res.data.map((log: any) => {
//             return {
//               id: log.ticketId, 
//               auditType: 'Help Desk',
//               date: new Date(log.createdDate).toLocaleDateString(), 
//               commodity: 'System', 
//               category: 'Support', 
//               sender: log.userName,          
//               moduleName: log.moduleName,    
//               issue: log.subject,            
//               severity: 'Medium'             
//             };
//           });

//           // Add the newly fetched tickets to the dropdown list
//           this.notifications = [...liveTickets, ...this.notifications];
//         }
//       },
//       error: (err: any) => {
//         console.error(err);
//       }
//     });
//   }

fetchNotifications() { 
    const storedUserId = localStorage.getItem('UserId');
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;
    const currentUserType = localStorage.getItem('UserType') || 'Internal';

    if (currentUserId === 0) return;

    this.api.getHelpDeskNotifications(currentUserId, currentUserType).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const liveTickets: Notification[] = res.data.map((log: any) => {
            return {
              id: log.ticketId, 
              // 🔥 THIS IS THE FIX
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

          // Sort by ticket ID descending so latest item is at the top
          liveTickets.sort((a, b) => b.id - a.id);

          this.notifications = liveTickets;
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  closeNotificationMenu(): void {
    if (this.notificationMenuTrigger) {
      this.notificationMenuTrigger.closeMenu();
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