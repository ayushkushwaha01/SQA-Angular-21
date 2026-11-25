import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { PartsActionsGridComponent } from 'src/app/pages/internal-portal/parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
import { ActionDescRemarksComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { InspectionService } from 'src/app/pages/internal-portal/inspection/inspection.service';
import { InspectionDocspopComponent } from 'src/app/pages/internal-portal/inspection/inspection-capa/inspection-docspop/inspection-docspop.component';
import { AlertService } from 'src/app/shared/alert.service';
import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';

import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { ProcessAuditService } from 'src/app/pages/internal-portal/process-audits/process-audit.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: false,
  selector: 'app-supplier-capa',
  templateUrl: './supplier-capa.component.html',
  styleUrls: ['./supplier-capa.component.scss']
})
export class SupplierCapaComponent implements OnInit, AfterViewInit, OnDestroy {

  filterToggle: boolean = false;
  isAlertsView: boolean = false;

  // Pagination and Data Tracking
  originalTableList: any[] = [];
  tableList: any[] = [];
  pagedTableList: any[] = [];
  totalSize = 0;
  pageSize = 20;
  pageIndex = 0;
  alertsCount: number = 0;
  serverMode: boolean = false;
  private pagedUnsupported: boolean = false;
  isLoading: boolean = true;

  myGroup!: FormGroup;

  // Threshold Variables
  overdueThreshold: number = 9999;
  escalateThreshold: number = 9999;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private rafId: number | null = null;
  private scrollContainer: HTMLElement | null = null;
  private onScrollHandler = () => {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.updateStickyHeader();
        this.rafId = null;
      });
    }
  };

  TractorIdSections: any[] = [];
  responsibleSections: any[] = [];
  resSectionFilterLeads: any[] = [];

  constructor(
    public dialog: MatDialog,
    private api: InspectionService,
    private alertService: AlertService, 
    private partAuditService: PartAuditService,
    private manageUserService: ManageUsersService,
    private processAuditApi: ProcessAuditService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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

  ngAfterViewInit(): void {
    this.setupStickyHeader();
    if (this.paginator) {
      this.paginator.page.subscribe(() => {
        setTimeout(() => this.updateStickyHeader(), 50);
      });
    }
  }

  setupStickyHeader(): void {
    this.ngZone.runOutsideAngular(() => {
      this.scrollContainer = document.getElementById('main') || document.querySelector('mat-sidenav-content');
      if (this.scrollContainer) {
        this.scrollContainer.addEventListener('scroll', this.onScrollHandler, { passive: true });
      }
      window.addEventListener('scroll', this.onScrollHandler, { passive: true, capture: true });
      window.addEventListener('resize', this.onScrollHandler, { passive: true });
    });
    setTimeout(() => this.updateStickyHeader(), 100);
  }

  updateStickyHeader(): void {
    const container = document.getElementById('grid-table-container') || document.getElementById('table-responsive');
    if (!container) return;

    const table = (container.querySelector('.audit-table') || container.querySelector('.custom-grid-table')) as HTMLElement;
    const thead = container.querySelector('thead') as HTMLElement;
    if (!table || !thead) return;

    const rect = container.getBoundingClientRect();
    const theadHeight = thead.offsetHeight || 44;
    const navHeight = 56;

    const offset = navHeight - rect.top;
    const maxOffset = Math.max(0, rect.height - theadHeight);
    const translateY = Math.max(0, Math.min(offset, maxOffset));

    if (translateY > 0) {
      table.style.setProperty('--sticky-header-offset', `${Math.round(translateY)}px`);
      if (!thead.classList.contains('is-sticky')) {
        thead.classList.add('is-sticky');
      }
    } else {
      table.style.removeProperty('--sticky-header-offset');
      if (thead.classList.contains('is-sticky')) {
        thead.classList.remove('is-sticky');
      }
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.onScrollHandler);
    }
    window.removeEventListener('scroll', this.onScrollHandler, { capture: true } as any);
    window.removeEventListener('scroll', this.onScrollHandler);
    window.removeEventListener('resize', this.onScrollHandler);
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

  private mapRows(list: any[]): any[] {
    return (list || []).map((item: any) => {
      let delayVal: any = '-';
      let calculatedDelay = 0;

      if (item.dueDate) {
        const due = new Date(item.dueDate);
        const completion = item.completion ? new Date(item.completion) : new Date();
        due.setHours(0, 0, 0, 0);
        completion.setHours(0, 0, 0, 0);

        const diffTime = completion.getTime() - due.getTime();
        if (diffTime > 0) {
          delayVal = Math.floor(diffTime / (1000 * 3600 * 24));
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
        calculatedDelayInDays: calculatedDelay,
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
  }

  loadData() {
    if (this.pagedUnsupported) {
      this.loadDataLegacy();
      return;
    }

    const supplierId = this.getSupplierId();
    const f = this.myGroup ? this.myGroup.value : {};
    this.isLoading = true;

    this.api.getPendingCapaPaged({
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      supplierId: supplierId > 0 ? supplierId : null,
      keyword: f.Keyword?.trim(),
      processCategory: f.TractorIdSections,
      supplierName: f.ResponsibleSections,
      actionType: f.ResponsibleSectionLeadId
    }).pipe(finalize(() => { this.isLoading = false; })).subscribe({
      next: (res: any) => {
        if (!res || !res.success || res.totalCount === undefined) {
          this.pagedUnsupported = true;
          this.loadDataLegacy();
          return;
        }
        this.serverMode = true;
        this.originalTableList = this.mapRows(res.data || []);
        this.tableList = [...this.originalTableList];
        this.totalSize = res.totalCount ?? 0;
        this.pagedTableList = this.tableList;
        this.alertsCount = this.originalTableList.filter(item => item.isAlert).length;

        const fo = res.filterOptions;
        if (fo) {
          this.TractorIdSections = (fo.processCategories || []).map((val: string) => ({ item_id: val, item_text: val }));
          this.responsibleSections = (fo.suppliers || []).map((val: string) => ({ item_id: val, item_text: val }));
          this.resSectionFilterLeads = (fo.actionTypes || []).map((val: string) => ({ UserId: val, UserName: val }));
        }

        setTimeout(() => this.updateStickyHeader(), 50);
      },
      error: () => {
        this.pagedUnsupported = true;
        this.loadDataLegacy();
      }
    });
  }

  private loadDataLegacy() {
    const supplierId = this.getSupplierId();

    this.isLoading = true;
    this.api.getPendingCapaRecords(supplierId).pipe(finalize(() => { this.isLoading = false; })).subscribe((res: any) => {
      if (res.success && res.data) {
        this.serverMode = false;
        this.originalTableList = this.mapRows(res.data || []);
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
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }

    if (this.serverMode && !this.isAlertsView) {
      this.loadData();
      return;
    }

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
    this.updatePagination();
  }

  clearFilter() {
    this.myGroup.reset();
    this.isAlertsView = false;
    this.pageIndex = 0;

    if (this.paginator) {
      this.paginator.firstPage();
    }

    if (this.serverMode) {
      this.loadData();
      return;
    }

    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;
    this.updatePagination();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.serverMode && !this.isAlertsView) {
      this.loadData();
    } else {
      this.updatePagination();
    }
  }

  updatePagination() {
    if (this.serverMode && !this.isAlertsView) {
      this.pagedTableList = this.tableList;
      setTimeout(() => this.updateStickyHeader(), 50);
      return;
    }
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTableList = this.tableList.slice(start, end);
    setTimeout(() => this.updateStickyHeader(), 50);
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
        this.cdr.detectChanges();
        setTimeout(() => this.updateStickyHeader(), 50);
      },
      error: (error: any) => {
        console.error('Error loading grid columns', error);
        this.activeColumns = [...this.defaultColumns];
        this.frozenCount = 0;
        this.cdr.detectChanges();
        setTimeout(() => this.updateStickyHeader(), 50);
      }
    });
  }
}
