import { Component, OnInit, ViewChild, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ProcessAuditService } from '../process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ActionDescRemarksComponent } from './action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsGridComponent } from './process-actions-grid/process-actions-grid.component';
import { ProcessActionsEditComponent } from './process-actions-edit/process-actions-edit.component';
import { ProcessDocPopComponent } from './process-doc-pop/process-doc-pop.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service'; // 🔥 Import permission service
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { PartAuditService } from '../../parts-audits/part-audit.service';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-paudits-actions',
  templateUrl: './paudits-actions.component.html',
  styleUrls: ['./paudits-actions.component.scss']
})
export class PauditsActionsComponent implements OnInit, AfterViewInit, OnDestroy {

  filterToggle: boolean = false;
  totalSize = 0;
  // Server-side paging state (falls back to client-side if the paged API is unavailable)
  serverMode = false;
  private pagedUnsupported = false;
  totalCount = 0;
  myGroup!: FormGroup;
  originalTableList: any[] = [];
  tableList: any[] = [];
  parentAuditRef: string = 'Pending...';
  targetCategoryId: any = null;
  targetChecklistId: any = null;

  processCategories: string[] = [];
  suppliers: string[] = [];
  actionTypes: string[] = [];

  capaStatusLookups: any[] = [];

  // 🔥 Screen Permissions for CAPA (Screen ID: 15)
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 15;

  isSupplier: boolean = false;

  pageSize = 20;
  pageIndex = 0;
  isLoading = true;

  overdueThreshold: number = 9999; // Default high so nothing turns red until data loads
  escalateThreshold: number = 9999; //   ADD THIS: New variable for the flag

  get pagedCapaData() {
    if (this.serverMode) return this.tableList;
    const start = this.pageIndex * this.pageSize;
    return this.tableList.slice(start, start + this.pageSize);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.serverMode) { this.loadData(); return; }
    setTimeout(() => this.updateStickyHeader(), 50);
  }

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
    private api: ProcessAuditService,
    private alertService: AlertService,
    private partAuditService: PartAuditService,
    private ngZone: NgZone
  ) { }

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
    const container = document.getElementById('grid-table-container');
    if (!container) return;

    const table = container.querySelector('.audit-table') as HTMLElement;
    const thead = container.querySelector('.audit-table thead') as HTMLElement;
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

  ngOnInit(): void {

    this.isSupplier = localStorage.getItem('UserType') === 'Supplier' || 
                      window.location.href.toLowerCase().includes('role=supplier');

    // 🔥 Load Permissions (check both numeric ID 15 and string name 'CAPA')
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID) || UserPermissionService.fnGetReadPermissions('CAPA');
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetCreatePermissions('CAPA');
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID) || UserPermissionService.fnGetUpdatePermissions('CAPA');
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID) || UserPermissionService.fnGetDeletePermissions('CAPA');

    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      ProcessCategory: new FormControl(''),
      SupplierName: new FormControl(''),
      ActionType: new FormControl('')
    });

    this.loadData();
    this.loadLookups();
    this.loadGridColumns();

    // 🔥 Silently runs the escalation check and logs the result to the browser console!
    // this.api.triggerDailyEscalations().subscribe({
    //   next: (res: any) => console.log(' Background Escalation Check:', res.message),
    //   error: (err) => console.error(' Escalation Check Failed:', err)
    // });
  }

  loadLookups() {
    this.api.getEscalations().subscribe((res: any) => {
      if (res.success && res.data) {
        const overdue = res.data.find((x: any) => x.escalationName === 'Overdue');
        if (overdue && overdue.newValue) {
          this.overdueThreshold = parseInt(overdue.newValue, 10);
        }

        const escalate = res.data.find((x: any) => x.escalationName === 'Escalate');
        if (escalate && escalate.newValue) {
          this.escalateThreshold = parseInt(escalate.newValue, 10);
        }
      }
    });

    this.api.getLookups().subscribe((lookupRes: any) => {
      if (lookupRes.success) {
        this.capaStatusLookups = lookupRes.data.filter((l: any) => l.codeMasterName === 'Capa-Status');
      }
    });
  }

  
  // Tries the server-paged endpoint first; falls back to the legacy "get all" call if unavailable.
  private capaSource$() {
    const legacy$ = this.api.getAllCapas();
    if (this.pagedUnsupported) return legacy$;
    const f = this.myGroup?.value || {};
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      keyword: f.Keyword ? f.Keyword.trim() : '',
      processCategory: f.ProcessCategory,
      supplierName: f.SupplierName,
      actionType: f.ActionType
    };
    return this.api.getCapasPaged(params).pipe(
      map((r: any) => (r && r.success && r.totalCount !== undefined) ? { ...r, _server: true } : null),
      catchError(() => of(null)),
      switchMap((r: any) => {
        if (r) return of(r);
        this.pagedUnsupported = true;
        return legacy$;
      })
    );
  }

  loadData() {
    this.isLoading = true;
    this.capaSource$().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          // Sort latest CAPA on top
          this.serverMode = !!res._server;
          this.totalCount = res.totalCount ?? 0;
          const sortedData = (res.data || []).sort((a: any, b: any) => (b.capaId || 0) - (a.capaId || 0));

          this.originalTableList = sortedData.map((item: any) => {

            // 1. Map the Dropdown Status
            if (item.status && isNaN(Number(item.status))) {
              const matched = this.capaStatusLookups.find(l => l.lookupName.toLowerCase() === item.status.toLowerCase());
              item.status = matched ? matched.lookupId.toString() : '10019';
            } else if (!item.status) {
              item.status = '10019';
            }

            // 🔥 2. LIVE DELAY CALCULATION FIX 🔥
            // If there is a due date and the CAPA is NOT resolved, calculate the days between then and today
            if (item.dueDate && !item.resolved) {
              const currentDate = new Date();
              const dueDate = new Date(item.dueDate);

              // Calculate time difference in milliseconds
              const timeDiff = currentDate.getTime() - dueDate.getTime();

              // Convert milliseconds to full days
              const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

              // If the difference is greater than 0, it's overdue!
              item.delayInDays = daysDiff > 0 ? daysDiff : 0;
            } else {
              // If it is resolved or has no due date, delay is 0
              item.delayInDays = 0;
            }

            return item;
          });

          this.tableList = [...this.originalTableList];
          this.totalSize = this.serverMode ? this.totalCount : this.tableList.length;

          this.processCategories = (this.serverMode && res.filterOptions?.processCategories) || [...new Set(res.data.map((item: any) => item.processCategory).filter(Boolean))] as string[];
          this.suppliers = (this.serverMode && res.filterOptions?.suppliers) || [...new Set(res.data.map((item: any) => item.supplierName).filter(Boolean))] as string[];
          this.actionTypes = (this.serverMode && res.filterOptions?.actionTypes) || [...new Set(res.data.map((item: any) => item.actionType).filter(Boolean))] as string[];
          setTimeout(() => this.updateStickyHeader(), 50);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onStatusChange(item: any) {
    if (!this.canUpdate) return; // Guard clause

    const payload = {
      CapaId: item.capaId,
      Status: item.status != null ? item.status.toString() : null,
      IsResolved: item.resolved
    };

    this.api.updateCapaStatus(payload).subscribe((res: any) => {
      if (res.success) {
        this.alertService.createAlert('Status updated successfully', 1);
      } else {
        this.alertService.createAlert('Failed to update status', 0);
      }
    });
  }

  onResolvedChange(item: any, event: any) {
    // 🔥 Guard clause: Block if they are NOT a supplier, or if they lack update permissions
    if (!this.isSupplier || !this.canUpdate) return; 

    item.resolved = event.checked;

    const payload = {
      CapaId: item.capaId,
      Status: item.status != null ? item.status.toString() : null,
      IsResolved: item.resolved
    };

    this.api.updateCapaStatus(payload).subscribe((res: any) => {
      if (res.success) {
        this.alertService.createAlert(item.resolved ? 'Marked as Resolved' : 'Marked as Unresolved', 1);
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

  processgrid() {
    this.dialog.open(ProcessActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  editrow() {
    this.dialog.open(ProcessActionsEditComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(ProcessDocPopComponent, {
      width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog',
      data: {
        ...applicant,
        canCreate: this.canCreate,
        canUpdate: this.canUpdate,
        canDelete: this.canDelete
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
    });
  }

  imageSource1(description: string) {
    this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' });
  }

  deleteConfirmation(item: any) {
    if (!this.canDelete) return;

    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this CAPA?' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.api.deleteCapa({ CapaId: item.capaId }).subscribe((res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message || 'CAPA deleted successfully', 1);
            this.loadData();
          } else {
            this.alertService.createAlert(res.message || 'Failed to delete CAPA', 0);
          }
        });
      }
    });
  }

  go() {
    if (this.serverMode) { this.pageIndex = 0; this.loadData(); return; }
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase() : '';
    const category = filters.ProcessCategory;
    const supplier = filters.SupplierName;
    const actionType = filters.ActionType;

    this.tableList = this.originalTableList.filter(item => {
      let matches = true;
      if (keyword) {
        const searchStr = `${item.reference} ${item.actionSubject} ${item.supplierName} ${item.actionType} ${item.auditReference} ${item.processCategory}`.toLowerCase();
        matches = matches && searchStr.includes(keyword);
      }
      if (category) matches = matches && item.processCategory === category;
      if (supplier) matches = matches && item.supplierName === supplier;
      if (actionType) matches = matches && item.actionType === actionType;
      return matches;
    });

    this.pageIndex = 0;
    this.totalSize = this.tableList.length;
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  clearFilter() {
    this.myGroup.reset();
    if (this.serverMode) { this.pageIndex = 0; this.loadData(); return; }
    this.tableList = [...this.originalTableList];
    const maxPage = Math.max(0, Math.ceil(this.tableList.length / this.pageSize) - 1);
    if (this.pageIndex > maxPage) {
      this.pageIndex = maxPage;
    }
    this.totalSize = this.tableList.length;
    setTimeout(() => this.updateStickyHeader(), 50);
  }

  defaultColumns: string[] = [
    'Action',
    'Status',
    'Resolved',
    'Docs',
    'Reference',
    'CAPA Subject',
    'Supplier Name',
    'Action Type',
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

  frozenCount = 0;


  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Action': 80,
      'Status': 150,
      'Resolved': 100,
      'Docs': 80,
      'Reference': 160,
      'CAPA Subject': 220,
      'Supplier Name': 180,
      'Action Type': 150,
      'Process Category': 180,
      'Description': 100,
      'Supplier Remarks': 120,
      'Log Date': 130,
      'Due Date': 130,
      'Delay In Days': 130,
      'Completion Date': 150,
      'Severity': 120,
      'Occurrence': 120,
      'Detection': 120,
      'Risk Rating': 130,
      'Rating': 120,
      'PDCA Status': 150

    };

    return widths[column] || 150;
  }


  getStickyLeft(index: number): string {

    let left = 0;

    for (let i = 0; i < index; i++) {

      left += this.getColumnWidth(
        this.activeColumns[i]
      );

    }

    return left + 'px';
  }


  openColumnSelector() {

    const dialogRef = this.dialog.open(
      ColumnSelectorComponent,
      {
        width: '750px',
        height: 'auto',
        disableClose: true,

        data: {

          userId: 1, // Replace with logged-in user id

          gridType: 'ProcessCapaTable',

          defaultColumns: this.defaultColumns

        }

      }
    );


    dialogRef.afterClosed().subscribe(
      (didSave: boolean) => {

        if (didSave) {

          this.alertService.createAlert(
            'Column layout updated successfully.'
          );

          this.loadGridColumns();

        }

      }
    );

  }


  loadGridColumns() {

    const filter = {

      userId: 1, // Replace with logged-in user id

      gridType: 'ProcessCapaTable'

    };


    this.partAuditService
      .getgridcolumns(filter)
      .subscribe({

        next: (res: any) => {

          if (
            res.success &&
            res.data
          ) {

            const parsedData =
              JSON.parse(
                res.data.selectedColumnsJSON
              );


            // Old format support
            if (
              Array.isArray(parsedData)
            ) {

              this.activeColumns =
                parsedData;

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

            this.activeColumns =
              [...this.defaultColumns];

            this.frozenCount = 0;

          }

        },


        error: (error) => {

          console.error(
            'Error loading grid columns',
            error
          );

          this.activeColumns =
            [...this.defaultColumns];

          this.frozenCount = 0;

        }

      });

    setTimeout(() => this.updateStickyHeader(), 50);
  }
}