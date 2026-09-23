import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderService } from 'src/app/shared/page-header.service';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';

export interface NotificationItem {
  id: number;
  auditType: 'Process Audit' | 'Parts Audit' | 'Help Desk' | 'System Escalation'; 
  date: string;
  commodity: string;
  category: string;
  issue?: string;
  partFamily?: string;
  parameter?: string;
  severity: 'Critical' | 'Important' | 'Medium' | 'Low';
  isRead: boolean;
  sender?: string;
  moduleName?: string;
  description?: string;
}

@Component({
  selector: 'app-notifications-inbox',
  templateUrl: './notifications-inbox.component.html',
  styleUrls: ['./notifications-inbox.component.scss']
})
export class NotificationsInboxComponent implements OnInit, OnDestroy {

  selectedItem: NotificationItem | null = null;
  searchQuery: string = '';

  notificationsList: NotificationItem[] = [];

  constructor(
    private api: ManageUsersService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private pageHeaderService: PageHeaderService
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/app/sqm']);
    }
  }

  fetchData(): void {
    const storedUserId = localStorage.getItem('UserId');
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;
    const currentUserType = localStorage.getItem('UserType') || 'Internal';

    if (currentUserId === 0) return;

    this.api.getHelpDeskNotifications(currentUserId, currentUserType).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const liveTickets: NotificationItem[] = res.data.map((log: any) => {
            return {
              id: log.ticketId,
              auditType: log.moduleName === 'System Escalation' ? 'System Escalation' : 'Help Desk',
              date: new Date(log.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              commodity: 'System',
              category: 'Support',
              sender: log.userName || 'System Bot',
              moduleName: log.moduleName || 'General',
              issue: log.subject || 'System Notification',
              description: log.description || '',
              severity: (log.subject && log.subject.toLowerCase().includes('overdue')) ? 'Critical' : 'Medium',
              isRead: false
            };
          });

          // Sort by ticket ID descending so latest item is at the top
          liveTickets.sort((a, b) => b.id - a.id);

          this.notificationsList = liveTickets;
          this.autoSelectFirst();
        }
      },
      error: (err) => {
        console.error('Failed to fetch help desk logs', err);
      }
    });
  }

  autoSelectFirst(): void {
    const filtered = this.filteredItems;
    if (filtered.length > 0) {
      this.selectItem(filtered[0]);
    } else {
      this.selectedItem = null;
    }
  }

  selectItem(item: NotificationItem): void {
    this.selectedItem = item;
    item.isRead = true;
  }

  get filteredItems(): NotificationItem[] {
    return this.notificationsList.filter(item => {
      // Exclude Help Desk Mails so Notifications contains ONLY system notifications/escalations
      if (item.auditType === 'Help Desk') {
        return false;
      }

      // Search query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const text = `${item.auditType} ${item.commodity} ${item.category} ${item.issue || ''} ${item.sender || ''} ${item.moduleName || ''} ${item.parameter || ''} ${item.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }

  get notificationCount(): number {
    return this.filteredItems.length;
  }

  getIcon(item: NotificationItem | null): string {
    if (!item) return 'notifications';
    if (item.auditType === 'System Escalation') return 'warning';
    if (item.auditType === 'Process Audit') return 'assignment_turned_in';
    if (item.auditType === 'Parts Audit') return 'build';
    return 'notifications';
  }

  getSeverityClass(item: NotificationItem | null): string {
    if (!item) return 'medium';
    if (item.severity === 'Critical' || (item.issue && item.issue.toLowerCase().includes('overdue'))) {
      return 'critical';
    }
    return 'medium';
  }

  getSeverityLabel(item: NotificationItem | null): string {
    if (!item) return 'NOTIFICATION';
    if (item.severity === 'Critical' || (item.issue && item.issue.toLowerCase().includes('overdue'))) {
      return 'CRITICAL OVERDUE ALERT';
    }
    return 'SYSTEM NOTIFICATION';
  }

  navigateToCapa(item: NotificationItem | null): void {
    if (!item) return;
    const text = (item.issue || '') + ' ' + (item.description || '');
    if (text.includes('PARTCAPA') || text.toLowerCase().includes('parts')) {
      this.router.navigate(['/app/sqm/parts/parts-actions']);
    } else {
      this.router.navigate(['/app/sqm/process/actions']);
    }
  }

  getFormattedDescription(text: string | undefined): string {
    if (!text) return 'No description provided.';
    return text.replace(/(\b\d+\s*days?\b)/gi, '<span class="overdue-highlight">$1</span>');
  }
}