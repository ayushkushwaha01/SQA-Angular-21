import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { ActionDescRemarksComponent } from '../../process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { ProcessActionsEditComponent } from '../../process-audits/paudits-actions/process-actions-edit/process-actions-edit.component';
import { PartsActionsDocsComponent } from '../../parts-audits/parts-actions/parts-actions-docs/parts-actions-docs.component';
import { ProcessActionsGridComponent } from '../../process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { PartsActionsGridComponent } from '../../parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
import { PartsActionsEditComponent } from '../../parts-audits/parts-actions/parts-actions-edit/parts-actions-edit.component';
import { InspectionService } from '../inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { InspectionDocspopComponent } from './inspection-docspop/inspection-docspop.component';
import { CapaEditPopComponent } from './capa-edit-pop/capa-edit-pop.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { PartAuditService } from '../../parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-inspection-capa',
  templateUrl: './inspection-capa.component.html',
  styleUrls: ['./inspection-capa.component.scss'],
  providers: [DatePipe]
})
export class InspectionCapaComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  filterToggle: boolean = false;
  totalSize = 0;
  // Server-side paging state (falls back to client-side if the paged API is unavailable)
  serverMode = false;
  // private pagedUnsupported = true;


   private pagedUnsupported = false;
  totalCount = 0;
  private serverFilterOptions: any = null;
  pageSize = 20;
  pageIndex = 0;
  pagedTableList: any[] = [];
  myGroup!: FormGroup;

  tableList: any[] = [];
  originalTableList: any[] = [];
  processCategories: string[] = [];
  supplierNames: string[] = [];
  actionTypes: string[] = [];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadCAPAScreen: boolean = false;
  readonly SCREEN_ID: number = 29;
  readonly SCREEN_IDd: number = 42;

  overdueThreshold: number = 9999;
  escalateThreshold: number = 9999;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  constructor(
    public dialog: MatDialog,
    private inspectionService: InspectionService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private partAuditService: PartAuditService,
    private manageUserService: ManageUsersService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    this.canreadCAPAScreen = UserPermissionService.fnGetReadPermissions(this.SCREEN_IDd);

    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      TractorIdSections: new FormControl(''),
      ResponsibleSections: new FormControl(''),
      ResponsibleSectionLeadId: new FormControl('')
    });

    // 🔥 1. Fetch Escalation Thresholds FIRST, then fetch the data
    this.manageUserService.getEscalation().subscribe((res: any) => {
      if (res.success && res.data) {
        // Grab Overdue (for red text)
        const overdue = res.data.find((x: any) => x.escalationName === 'Overdue');
        if (overdue && overdue.newValue) this.overdueThreshold = parseInt(overdue.newValue, 10);

        // Grab Escalate (for the flag icon)
        const escalate = res.data.find((x: any) => x.escalationName === 'Escalate');
        if (escalate && escalate.newValue) this.escalateThreshold = parseInt(escalate.newValue, 10);
      }

      // 🔥 2. NOW fetch the table data
      this.fetchPendingCapas();
    });

    this.loadGridColumns();
  }

  // Tries the server-paged endpoint first; falls back to the legacy "get all" call if unavailable.
  private capaSource$() {
    const legacy$ = this.inspectionService.getPendingCapaRecords();
    if (this.pagedUnsupported) return legacy$;
    const f = this.myGroup?.value || {};
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      keyword: f.Keyword ? f.Keyword.trim() : '',
      processCategory: f.TractorIdSections,
      supplierName: f.ResponsibleSections,
      actionType: f.ResponsibleSectionLeadId
    };
    return this.inspectionService.getPendingCapaPaged(params).pipe(
      map((r: any) => (r && r.success && r.totalCount !== undefined) ? { ...r, _server: true } : null),
      catchError(() => of(null)),
      switchMap((r: any) => {
        if (r) return of(r);
        this.pagedUnsupported = true;
        return legacy$;
      })
    );
  }

  fetchPendingCapas() {
    this.isLoading = true;
    this.capaSource$().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.serverMode = !!res._server;
          this.totalCount = res.totalCount ?? 0;
          this.serverFilterOptions = res.filterOptions || null;
          const sortedData = (res.data || []).sort((a: any, b: any) => {
            if (b.capaId && a.capaId && b.capaId !== a.capaId) {
              return b.capaId - a.capaId;
            }
            return (b.reference || '').localeCompare(a.reference || '', undefined, { numeric: true });
          });
          this.tableList = sortedData.map((item: any) => {

            let delayVal: any = 'N/A';
            let calculatedDelay = 0; // 🔥 Added for the Red Flag UI

            if (item.dueDate) {
              const due = new Date(item.dueDate);
              const completion = item.completion ? new Date(item.completion) : new Date();
              due.setHours(0, 0, 0, 0);
              completion.setHours(0, 0, 0, 0);
              const diffTime = completion.getTime() - due.getTime();

              if (diffTime > 0) {
                delayVal = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // 🔥 If it's NOT resolved, and NOT completed, mark it as overdue for the UI
                if (!item.resolved) {
                  calculatedDelay = delayVal;
                }
              } else {
                delayVal = 'N/A';
              }
            }

            return {
              capaId: item.capaId,
              inspectionRefId: item.inspectionRefId,
              status: item.status,
              resolved: item.resolved,
              docs: item.docs,
              reference: item.reference,
              actionSubject: item.actionSubject,
              description: item.description,
              comments: item.comments,
              correctiveAction: item.correctiveAction,
              preventiveAction: item.preventiveAction,
              parameterName: item.parameterName,
              partFamily: item.partFamily,
              partName: item.partName,
              supplierName: item.supplierName,
              actionType: item.actionType,
              auditReference: item.auditReference,
              processCategory: item.processCategory,
              logDate: item.logDate,
              dueDate: item.dueDate,
              completion: item.completion,
              delayInDays: delayVal,

              // 🔥 Map the calculated delay to the UI
              calculatedDelayInDays: calculatedDelay,

              severity: item.severity,
              occurrence: item.occurrence,
              detection: item.detection,
              detectionRating: item.detectionRating,
              occurrenceRating: item.occurrenceRating,
              riskRating: item.riskRating || 'N/A',
              rating: item.rating,
              pdcaStatus: item.pdcaStatus
            };
          });

          this.originalTableList = [...this.tableList];
          if (!this.serverMode) { this.pageIndex = 0; }
          this.updatePagedList();
          this.populateFilterDropdowns();
          this.cdr.detectChanges();
          setTimeout(() => this.updateStickyHeader(), 50);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error fetching CAPA records:", err);
      }
    });
  }

  populateFilterDropdowns() {
    const o = this.serverMode ? this.serverFilterOptions : null;
    if (o) {
      this.processCategories = o.processCategories || [];
      this.supplierNames = o.supplierNames || [];
      this.actionTypes = o.actionTypes || [];
      return;
    }
    this.processCategories = Array.from(new Set(this.originalTableList.map(item => item.processCategory).filter(Boolean))).sort();
    this.supplierNames = Array.from(new Set(this.originalTableList.map(item => item.supplierName).filter(Boolean))).sort();
    this.actionTypes = Array.from(new Set(this.originalTableList.map(item => item.actionType).filter(Boolean))).sort();
  }

  onInlineChange(applicant: any) {
    const payload = {
      capaId: applicant.capaId,
      status: applicant.status,
      resolved: applicant.resolved
    };

    this.inspectionService.updateCapaInlineStatus(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('Record updated successfully', 1);
        } else {
          this.alertService.createAlert(res.message || 'Failed to update record', 0);
        }
      },
      error: (err) => {
        console.error("Failed to update record", err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while updating the record.', 0);
      }
    });
  }

  deleteConfirmation(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: 'Are you sure you want to permanently delete this CAPA record?',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inspectionService.deleteCapa(item.capaId).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('CAPA deleted successfully!', 1);
              this.fetchPendingCapas();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete CAPA', 0);
            }
          },
          error: () => this.alertService.createAlert('An error occurred while deleting the CAPA record.', 0)
        });
      }
    });
  }

  scrollRight() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollLeft() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
  }

  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(InspectionDocspopComponent, {
      width: '750px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog',
      data: {
        capaId: applicant.capaId,
        inspectionRefId: applicant.inspectionRefId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchPendingCapas();
    });
  }

  updatePagedList() {
    if (this.serverMode) {
      this.pagedTableList = this.tableList;
      this.totalSize = this.totalCount;
      return;
    }
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedTableList = this.tableList.slice(startIndex, endIndex);
    this.totalSize = this.tableList.length;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    if (this.serverMode) { this.fetchPendingCapas(); return; }
    this.updatePagedList();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  go() {
    if (this.serverMode) { this.pageIndex = 0; this.fetchPendingCapas(); return; }
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase().trim() : '';
    const processCategory = filters.TractorIdSections;
    const supplierName = filters.ResponsibleSections;
    const actionType = filters.ResponsibleSectionLeadId;

    this.tableList = this.originalTableList.filter(item => {
      let isMatch = true;

      if (keyword) {
        isMatch = isMatch && !!(item.actionSubject && item.actionSubject.toLowerCase().includes(keyword));
      }
      if (processCategory) {
        isMatch = isMatch && item.processCategory === processCategory;
      }
      if (supplierName) {
        isMatch = isMatch && item.supplierName === supplierName;
      }
      if (actionType) {
        isMatch = isMatch && item.actionType === actionType;
      }
      return isMatch;
    });

    this.pageIndex = 0;
    this.updatePagedList();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  clearFilter() {
    this.myGroup.reset();
    if (this.serverMode) { this.pageIndex = 0; this.fetchPendingCapas(); return; }
    this.tableList = [...this.originalTableList];
    this.pageIndex = 0;
    this.updatePagedList();
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  ngAfterViewInit(): void {
    this.setupStickyHeader();
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
    const navHeight = 56; // Fixed black top navigation bar height

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
    'Delete',
    'Status',
    'Resolved',
    'Docs',
    'Reference',
    'CAPA Subject',
    'Auditor Remarks',
    'Corrective Actions',
    'Preventive Actions',
    'Parameter Name',
    'Part Family',
    'Part Name',
    'Supplier Name',
    'Action Type',
    'Audit Reference',
    'Process Category',
    'Log Date',
    'Due Date',
    'Delay In Days',
    'Completion Date',
    'Severity',
    'Occurrence',
    'Detection',
    // 'Risk Rating',
    // 'Rating',
    'PDCA Status'
  ];

  activeColumns: string[] = [];

  frozenCount = 0;

  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Delete': 80,
      'Status': 150,
      'Resolved': 100,
      'Docs': 100,
      'Reference': 150,
      'CAPA Subject': 180,
      'Auditor Remarks': 180,
      'Corrective Actions': 180,
      'Preventive Actions': 180,
      'Parameter Name': 180,
      'Part Family': 180,
      'Part Name': 180,
      'Supplier Name': 180,
      'Action Type': 150,
      'Audit Reference': 180,
      'Process Category': 180,
      'Log Date': 130,
      'Due Date': 130,
      'Delay In Days': 130,
      'Completion Date': 150,
      'Severity': 120,
      'Occurrence': 120,
      'Detection': 120,
      // 'Risk Rating': 150,
      // 'Rating': 120,
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
        userId: 1,
        gridType: 'InspectionCapaTable',
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
      userId: 1,
      gridType: 'InspectionCapaTable'
    };

    this.partAuditService.getgridcolumns(filter).subscribe({

      next: (res: any) => {

        if (res.success && res.data) {

          const parsedData =
            JSON.parse(res.data.selectedColumnsJSON);

          // Old format support
          if (Array.isArray(parsedData)) {

            this.activeColumns = parsedData;
            this.frozenCount = 0;

          }
          else {

            this.activeColumns =
              parsedData.columns || [...this.defaultColumns];

            this.frozenCount =
              parsedData.frozenCount || 0;

          }

        }
        else {

          this.activeColumns = [...this.defaultColumns];
          this.frozenCount = 0;

        }
        this.cdr.detectChanges();
        setTimeout(() => this.updateStickyHeader(), 50);

      },

      error: (error) => {

        console.error(
          'Error loading grid columns',
          error
        );

        this.activeColumns = [...this.defaultColumns];
        this.frozenCount = 0;
        this.cdr.detectChanges();
        setTimeout(() => this.updateStickyHeader(), 50);

      }

    });

  }
}