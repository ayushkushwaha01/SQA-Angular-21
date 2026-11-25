import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ProcessAuditService } from 'src/app/pages/internal-portal/process-audits/process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ActionDescRemarksComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsGridComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { ProcessDocPopComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/process-doc-pop/process-doc-pop.component';
import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: false,
  selector: 'app-sup-procapa',
  templateUrl: './sup-procapa.component.html',
  styleUrls: ['./sup-procapa.component.scss']
})
export class SupProcapaComponent implements OnInit, AfterViewInit, OnDestroy {

  // Sticky Header state
  private rafId: number | null = null;
  private scrollContainer: HTMLElement | null = null;
  private onScrollHandler = () => {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateStickyHeader();
    });
  };

  filterToggle: boolean = false;
  isAlertsView: boolean = false;
  totalSize = 0;
  pageIndex = 0;
  pageSize: number = 20;
  serverMode: boolean = false;
  private pagedUnsupported: boolean = false;
  isLoading: boolean = true;
  myGroup!: FormGroup;

  originalTableList: any[] = [];
  tableList: any[] = [];
  pagedTableList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  TractorIdSections: any[] = [];
  responsibleSections: any[] = [];
  resSectionFilterLeads: any[] = [];

  overdueThreshold: number = 9999; 
  escalateThreshold: number = 9999;

  constructor(
    public dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService, private partAuditService: PartAuditService,
    private manageUserService: ManageUsersService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
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
      ResponsibleSectionLeadId: new FormControl('')
    });

    this.manageUserService.getEscalation().subscribe((res: any) => {
      if (res.success && res.data) {
        const overdue = res.data.find((x: any) => x.escalationName === 'Overdue' || x.EscalationName === 'Overdue');
        if (overdue) this.overdueThreshold = parseInt(overdue.newValue || overdue.NewValue, 10);

        const escalate = res.data.find((x: any) => x.escalationName === 'Escalate' || x.EscalationName === 'Escalate');
        if (escalate) this.escalateThreshold = parseInt(escalate.newValue || escalate.NewValue, 10);
      }
      this.loadData();
    });

    this.loadGridColumns();
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
      let calculatedDelay: any = '-';
      if (item.dueDate) {
        const due = new Date(item.dueDate);
        const completion = item.completion ? new Date(item.completion) : new Date();
        due.setHours(0, 0, 0, 0);
        completion.setHours(0, 0, 0, 0);

        const diffTime = completion.getTime() - due.getTime();
        if (diffTime > 0) {
          calculatedDelay = Math.floor(diffTime / (1000 * 3600 * 24));
        }
      }

      return {
        capaId: item.capaId,
        processAuditId: item.processAuditId,
        processCategoryId: item.processCategoryId,
        checklistId: item.checklistId,
        auditReference: item.auditReference,
        status: item.status,
        resolved: item.resolved,
        docs: item.docs,
        reference: item.reference,
        actionSubject: item.actionSubject,
        supplierName: item.supplierName,
        actionType: item.actionType,
        processCategory: item.processCategory,
        description: item.description,
        supplierRemarks: item.supplierRemarks,
        logDate: new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
        dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
        completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
        delayInDays: calculatedDelay,
        severity: item.severity,
        occurrence: item.occurrence,
        detection: item.detection,
        riskRating: item.riskRating,
        rating: item.rating,
        pdcaStatus: item.pdcaStatus,
        isAlert: calculatedDelay !== '-' && calculatedDelay > 5
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

    this.api.getCapasPaged({
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
    this.api.getAllCapasSupplie(supplierId).pipe(finalize(() => { this.isLoading = false; })).subscribe((res: any) => {
      if (res.success) {
        this.serverMode = false;
        this.originalTableList = this.mapRows(res.data || []);

        this.tableList = [...this.originalTableList];
        this.totalSize = this.tableList.length;
        this.updatePagination();

        // Dynamic filters
        this.TractorIdSections = [...new Set(res.data.map((i: any) => i.processCategory).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
        this.responsibleSections = [...new Set(res.data.map((i: any) => i.supplierName).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
        this.resSectionFilterLeads = [...new Set(res.data.map((i: any) => i.actionType).filter(Boolean))].map(val => ({ UserId: val, UserName: val }));
        setTimeout(() => this.updateStickyHeader(), 50);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.serverMode && !this.isAlertsView) {
      this.loadData();
    } else {
      this.updatePagination();
      setTimeout(() => this.updateStickyHeader(), 50);
    }
  }

  updatePagination() {
    if (this.serverMode && !this.isAlertsView) {
      this.pagedTableList = this.tableList;
      return;
    }
    const startIndex = this.pageIndex * this.pageSize;
    this.pagedTableList = this.tableList.slice(startIndex, startIndex + this.pageSize);
  }

  ngAfterViewInit() {
    this.setupStickyHeader();
    this.updatePagination();
  }

  get alertsCount(): number { return this.originalTableList.filter(item => item.isAlert).length; }

  toggleAlerts() {
    this.isAlertsView = !this.isAlertsView;
    this.tableList = this.isAlertsView ? this.originalTableList.filter(item => item.isAlert) : [...this.originalTableList];
    this.totalSize = this.tableList.length;
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  go() {
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();

    if (this.serverMode && !this.isAlertsView) {
      this.loadData();
      return;
    }

    const filters = this.myGroup.value;
    const keyword = filters.Keyword?.toLowerCase() || '';
    const processCat = filters.TractorIdSections;
    const actionType = filters.ResponsibleSectionLeadId;

    let baseList = this.isAlertsView ? this.originalTableList.filter(item => item.isAlert) : this.originalTableList;

    this.tableList = baseList.filter(item => {
      let isMatch = true;
      if (keyword) {
        const searchStr = `${item.reference} ${item.actionSubject} ${item.actionType} ${item.auditReference} ${item.description}`.toLowerCase();
        isMatch = isMatch && searchStr.includes(keyword);
      }
      if (processCat) isMatch = isMatch && item.processCategory === processCat;
      if (actionType) isMatch = isMatch && item.actionType === actionType;

      return isMatch;
    });

    this.totalSize = this.tableList.length;
    this.updatePagination();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  clearFilter() {
    this.myGroup.reset();
    this.isAlertsView = false;
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();

    if (this.serverMode) {
      this.loadData();
      return;
    }

    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;
    this.updatePagination();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  onResolvedChange(item: any, event: any) {
    item.resolved = event.checked;

    const payload = {
      CapaId: item.capaId,
      Status: item.status != null ? item.status.toString() : null, 
      IsResolved: item.resolved
    };

    this.api.updateCapaStatus(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert(item.resolved ? 'Marked as Resolved' : 'Marked as Unresolved', 1);

          if (item.resolved) {
            const notifPayload = {
              UserId: Number(localStorage.getItem('UserId')) || 0,
              UserType: localStorage.getItem('UserType') || 'Supplier',
              UserName: 'System Alert',
              ModuleName: 'CAPA Resolution',
              Subject: `CAPA Resolved: ${item.reference}`,
              Description: `Supplier has successfully marked Process CAPA ${item.reference} as Resolved. It is now pending internal review.`,
              SentToEmail: localStorage.getItem('Email') || 'admin@sqa.com'
            };
            this.api.sendHelpDeskMail(notifPayload).subscribe();
          }

        } else {
          this.alertService.createAlert(res.message || 'Failed to update status', 0);
          item.resolved = !event.checked;
        }
      },
      error: () => {
        this.alertService.createAlert('Error updating CAPA status', 0);
        item.resolved = !event.checked;
      }
    });
  }

  scrollRight() { document.getElementById('grid-table-container')?.scrollBy({ left: 300, behavior: 'smooth' }); }
  scrollLeft() { document.getElementById('grid-table-container')?.scrollBy({ left: -300, behavior: 'smooth' }); }

  imageSource1() { this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' }); }
  processgrid() { this.dialog.open(ProcessActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' }); }
  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(ProcessDocPopComponent, {
      width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog', data: applicant
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
    });
  }

  deleteConfirmation(item: any) {
    this.alertService.createAlert('Suppliers do not have permission to delete CAPA records.', 0);
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

  defaultColumns: string[] = [
    'Status',
    'Resolved',
    'Docs',
    'Reference',
    'CAPA Subject',
    'Supplier Name',
    'Action Type',
    'Audit Reference',
    'Process Category',
    'Description',
    'Supplier Remarks',
    'Log Date',
    'Due Date',
    'Delay In Days',
    'Completion Date',
    'Severity',
    'Occurrence',
    'Detection',
    'Risk Rating',
    'Rating',
    'PDCA Status'
  ];

  activeColumns: string[] = [];

  frozenCount: number = 0;


  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Status': 150,
      'Resolved': 110,
      'Docs': 100,
      'Reference': 180,
      'CAPA Subject': 220,
      'Supplier Name': 180,
      'Action Type': 150,
      'Audit Reference': 180,
      'Process Category': 180,
      'Description': 120,
      'Supplier Remarks': 120,
      'Log Date': 150,
      'Due Date': 150,
      'Delay In Days': 140,
      'Completion Date': 160,
      'Severity': 120,
      'Occurrence': 120,
      'Detection': 120,
      'Risk Rating': 150,
      'Rating': 120,
      'PDCA Status': 150

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

      width: '750px',
      height: 'auto',
      disableClose: true,

      data: {
        userId: 1, // Replace with logged-in user ID
        gridType: 'SupplierCapaTable',
        defaultColumns: this.defaultColumns
      }

    });

    dialogRef.afterClosed().subscribe((didSave: boolean) => {

      if (didSave) {

        this.alertService.createAlert(
          'Column layout updated successfully.'
        );

        this.loadGridColumns();

      }

    });

  }


  loadGridColumns() {

    const filter = {
      userId: 1, // Replace with logged-in user ID
      gridType: 'SupplierCapaTable'
    };

    this.partAuditService.getgridcolumns(filter).subscribe({

      next: (res: any) => {

        if (res.success && res.data) {

          const parsedData = JSON.parse(
            res.data.selectedColumnsJSON
          );

          // Support old format
          if (Array.isArray(parsedData)) {

            this.activeColumns = parsedData;
            this.frozenCount = 0;

          }
          else {

            this.activeColumns =
              parsedData.columns ||
              [...this.defaultColumns];

            this.frozenCount =
              parsedData.frozenCount || 0;

          }

        }
        else {

          this.activeColumns = [
            ...this.defaultColumns
          ];

          this.frozenCount = 0;
          this.cdr.detectChanges();
          setTimeout(() => this.updateStickyHeader(), 50);

        }

      },

      error: (error: any) => {

        console.error(
          'Error loading grid columns',
          error
        );

        this.activeColumns = [
          ...this.defaultColumns
        ];

        this.frozenCount = 0;
        this.cdr.detectChanges();
        setTimeout(() => this.updateStickyHeader(), 50);

      }

    });

  }
}
