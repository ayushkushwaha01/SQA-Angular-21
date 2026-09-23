import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { PartsActionsGridComponent } from 'src/app/pages/internal-portal/parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
import { ActionDescRemarksComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { InspectionService } from 'src/app/pages/internal-portal/inspection/inspection.service';
import { InspectionDocspopComponent } from 'src/app/pages/internal-portal/inspection/inspection-capa/inspection-docspop/inspection-docspop.component';
import { AlertService } from 'src/app/shared/alert.service';
import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';

// ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Import ManageUsersService and ProcessAuditService
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { ProcessAuditService } from 'src/app/pages/internal-portal/process-audits/process-audit.service';
import { jwtDecode } from 'jwt-decode';
@Component({
  standalone: false,
  selector: 'app-supplier-capa',
  templateUrl: './supplier-capa.component.html',
  styleUrls: ['./supplier-capa.component.scss']
})
export class SupplierCapaComponent implements OnInit {

  filterToggle: boolean = false;
  isAlertsView: boolean = false;

  // Pagination and Data Tracking
  originalTableList: any[] = [];
  tableList: any[] = [];
  pagedTableList: any[] = [];
  totalSize = 0;
  pageSize = 5;
  pageIndex = 0;
  alertsCount: number = 0;

  myGroup!: FormGroup;

  // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Threshold Variables
  overdueThreshold: number = 9999;
  escalateThreshold: number = 9999;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  TractorIdSections = [
    { item_id: 1, item_text: 'ID-01' },
    { item_id: 2, item_text: 'ID-02' },
    { item_id: 3, item_text: 'ID-03' },
  ];
  responsibleSections = [
    { item_id: 1, item_text: 'Front Axle Bracket Area' },
    { item_id: 2, item_text: 'Gearbox' }
  ];
  resSectionFilterLeads = [
    { UserId: 'U001', UserName: 'Lead A' },
    { UserId: 'U002', UserName: 'Lead B' }
  ];

  constructor(
    public dialog: MatDialog,
    private api: InspectionService,
    private alertService: AlertService, 
    private partAuditService: PartAuditService,
    private manageUserService: ManageUsersService, // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Injected
    private processAuditApi: ProcessAuditService   // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Injected for sending emails
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');
    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      TractorIdSections: new FormControl(''),
      ResponsibleSections: new FormControl(''),
      ResponsibleSectionLeadId: new FormControl(''),
    });

    this.loadGridColumns();

    // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Fetch Matrix FIRST, then fetch data
    this.manageUserService.getEscalation().subscribe((res: any) => {
      if (res.success && res.data) {
        const overdue = res.data.find((x: any) => x.escalationName === 'Overdue' || x.EscalationName === 'Overdue');
        if (overdue) this.overdueThreshold = parseInt(overdue.newValue || overdue.NewValue, 10);

        const escalate = res.data.find((x: any) => x.escalationName === 'Escalate' || x.EscalationName === 'Escalate');
        if (escalate) this.escalateThreshold = parseInt(escalate.newValue || escalate.NewValue, 10);
      }
      this.loadData();
    });
  }


private getSupplierId(): number {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
          || decoded.nameid
          || decoded.SupplierId
          || decoded.supplierId
          || decoded.UserId
          || decoded.userId
          || decoded.sub;
        if (id && Number(id) > 0) {
          return Number(id);
        }
      } catch (err) {
        console.error('Error decoding token for supplierId:', err);
      }
    }
    const localSuppId = localStorage.getItem('SupplierId') || localStorage.getItem('UserId') || sessionStorage.getItem('SupplierId') || sessionStorage.getItem('UserId');
    return Number(localSuppId) || 0;
  }

  loadData() {
    // const supplierId = Number(localStorage.getItem('SupplierId')) || Number(localStorage.getItem('UserId')) || 0;
    const supplierId = this.getSupplierId();

    this.api.getPendingCapaRecords(supplierId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.originalTableList = res.data.map((item: any) => {
          
          let delayVal: any = '-';
          let calculatedDelay = 0;

          // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ PERMANENT DELAY CALCULATION
          if (item.dueDate) {
            const due = new Date(item.dueDate);
            const completion = item.completion ? new Date(item.completion) : new Date();
            due.setHours(0, 0, 0, 0);
            completion.setHours(0, 0, 0, 0);

            const diffTime = completion.getTime() - due.getTime();
            if (diffTime > 0) {
              delayVal = Math.floor(diffTime / (1000 * 3600 * 24));
              // Let delay stay permanent for the UI history
              calculatedDelay = delayVal;
            } else {
              delayVal = '-';
            }
          }

          return {
            id: item.capaId,
            inspectionRefId: item.inspectionRefId,
            status: item.status === 1 ? 'WIP' :
              item.status === 2 ? 'Open' :
                item.status === 3 ? 'Closed' :
                  item.status === 4 ? 'Pending' :
                    item.status === 5 ? 'In Progress' :
                      item.status === 6 ? 'Completed' : item.status,
            resolved: item.resolved,
            docs: item.docs,
            reference: item.reference,
            actionSubject: item.actionSubject,
            parameterName: item.parameterName,
            partFamilyName: item.partFamilyName,
            partName: item.partName,
            supplierName: item.supplierName,
            actionType: item.actionType,
            auditReference: item.auditReference,
            processCategory: item.processCategory,
            supplierRemarks: item.supplierRemarks,
            logDate: item.logDate ? new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            etaDate: item.etaDate ? new Date(item.etaDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            auditorRemarks: item.auditorRemarks,
            auditeeResponse: item.auditeeResponse,
            delayInDays: delayVal,
            calculatedDelayInDays: calculatedDelay, // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Bind permanent delay here
            completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            severity: item.severity,
            occurrence: item.occurrence,
            detection: item.detection,
            riskRating: item.riskRating || 'Medium',
            rating: item.rating,
            pdcaStatus: item.pdcaStatus || '-',
            isAlert: calculatedDelay > 5
          };
        });

        this.alertsCount = this.originalTableList.filter(item => item.isAlert).length;
        this.go();
      }
    });
  }

  toggleAlerts() {
    this.isAlertsView = !this.isAlertsView;
    this.go();
  }

  go() {
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase() : '';

    let baseList = this.isAlertsView
      ? this.originalTableList.filter(item => item.isAlert)
      : this.originalTableList;

    this.tableList = baseList.filter(item => {
      let isMatch = true;
      if (keyword) {
        isMatch = isMatch && (
          (item.actionSubject && item.actionSubject.toLowerCase().includes(keyword)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(keyword)) ||
          (item.reference && item.reference.toLowerCase().includes(keyword))
        );
      }
      return isMatch;
    });

    this.totalSize = this.tableList.length;
    this.pageIndex = 0;

    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagination();
  }

  clearFilter() {
    this.myGroup.reset();
    this.isAlertsView = false;
    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;
    this.pageIndex = 0;

    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagination();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  updatePagination() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTableList = this.tableList.slice(start, end);
  }

  scrollRight() {
    document.getElementById('grid-table-container')?.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollLeft() {
    document.getElementById('grid-table-container')?.scrollBy({ left: -300, behavior: 'smooth' });
  }

  imageSource1() { this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' }); }

  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(InspectionDocspopComponent, {
      width: '750px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog',
      data: {
        capaId: applicant.id,
        inspectionRefId: applicant.inspectionRefId,
        isReadOnly: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  processgrid() {
    this.dialog.open(PartsActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  deleteConfirmation(item: any) {
    this.dialog.open(ConfirmationDialogComponent, { width: 'auto', data: { title: 'Delete', content: 'Are you sure?' } });
  }

  onInlineChange(applicant: any) {
    let statusNum: number | null = null;
    if (typeof applicant.status === 'string') {
      const statusMap: { [key: string]: number } = {
        'WIP': 1, 'Open': 2, 'Closed': 3, 'Pending': 4, 'In Progress': 5, 'Completed': 6
      };
      statusNum = statusMap[applicant.status] || null;
    } else if (typeof applicant.status === 'number') {
      statusNum = applicant.status;
    }

    const payload = {
      capaId: applicant.id,
      status: statusNum,
      resolved: applicant.resolved
    };

    this.api.updateCapaInlineStatus(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('Record updated successfully', 1);

          // ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ NOTIFICATION EMAIL LOGIC
          if (applicant.resolved) {
            const notifPayload = {
              UserId: Number(localStorage.getItem('UserId')) || 0,
              UserType: localStorage.getItem('UserType') || 'Supplier',
              UserName: 'System Alert',
              ModuleName: 'CAPA Resolution',
              Subject: `Inspection CAPA Resolved: ${applicant.reference}`,
              Description: `Supplier has successfully marked Inspection CAPA ${applicant.reference} as Resolved. It is now pending internal review.`,
              SentToEmail: localStorage.getItem('Email') || 'admin@sqa.com'
            };
            this.processAuditApi.sendHelpDeskMail(notifPayload).subscribe();
          }

        } else {
          this.alertService.createAlert(res.message || 'Failed to update record', 0);
        }
      },
      error: (err: any) => {
        console.error("Failed to update record", err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while updating the record.', 0);
      }
    });
  }

  defaultColumns: string[] = [
    'Action', 'Status', 'Resolved', 'Docs', 'Reference', 'Subject',
    'Parameter Name', 'Part Family', 'Part Name', 'Supplier Name',
    'Action Type', 'Audit Reference', 'Process Category', 'Supplier Remarks',
    'Log Date', 'Due Date', 'ETA Date', 'Auditor Remarks', 'Auditee Response',
    'Delay In Days', 'Completion Date', 'Severity', 'Occurrence', 'Detection',
    'Risk Rating', 'Rating', 'PDCA Status'
  ];

  activeColumns: string[] = [];
  frozenCount = 0;

  getColumnWidth(column: string): number {
    const widths: { [key: string]: number } = {
      'Action': 100, 'Status': 150, 'Resolved': 100, 'Docs': 100,
      'Reference': 180, 'Subject': 200, 'Parameter Name': 180,
      'Part Family': 180, 'Part Name': 180, 'Supplier Name': 180,
      'Action Type': 150, 'Audit Reference': 180, 'Process Category': 180,
      'Supplier Remarks': 200, 'Log Date': 150, 'Due Date': 150,
      'ETA Date': 150, 'Auditor Remarks': 200, 'Auditee Response': 200,
      'Delay In Days': 130, 'Completion Date': 160, 'Severity': 120,
      'Occurrence': 120, 'Detection': 120, 'Risk Rating': 150,
      'Rating': 120, 'PDCA Status': 150
    };
    return widths[column] || 150;
  }

  getStickyLeft(index: number): string {
    let left = 0;
    for (let i = 0; i < index; i++) {
      left += this.getColumnWidth(this.activeColumns[i]);
    }
    return left + 'px';
  }

  openColumnSelector() {
    const dialogRef = this.dialog.open(ColumnSelectorComponent, {
      width: '750px', height: 'auto', disableClose: true,
      data: {
        userId: 1, gridType: 'SupplierInspectionCapaTable', defaultColumns: this.defaultColumns
      }
    });

    dialogRef.afterClosed().subscribe((didSave: boolean) => {
      if (didSave) {
        this.alertService.createAlert('Column layout updated successfully.');
        this.loadGridColumns();
      }
    });
  }

  loadGridColumns() {
    const filter = { userId: 1, gridType: 'SupplierInspectionCapaTable' };

    this.partAuditService.getgridcolumns(filter).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const parsedData = JSON.parse(res.data.selectedColumnsJSON);
          if (Array.isArray(parsedData)) {
            this.activeColumns = parsedData;
            this.frozenCount = 0;
          } else {
            this.activeColumns = parsedData.columns || [...this.defaultColumns];
            this.frozenCount = parsedData.frozenCount || 0;
          }
        } else {
          this.activeColumns = [...this.defaultColumns];
          this.frozenCount = 0;
        }
      },
      error: (error: any) => {
        console.error('Error loading grid columns', error);
        this.activeColumns = [...this.defaultColumns];
        this.frozenCount = 0;
      }
    });
  }
}