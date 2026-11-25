import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';

import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { ProcessAuditService } from 'src/app/pages/internal-portal/process-audits/process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';

import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: false,
  selector: 'app-sup-parts-capa',
  templateUrl: './sup-parts-capa.component.html',
  styleUrls: ['./sup-parts-capa.component.scss']
})
export class SupPartsCapaComponent implements OnInit, AfterViewInit, OnDestroy {

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

  tableList: any[] = [];
  originalTableList: any[] = [];
  allcaps: any[] = [];
  tableLists: any[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  filterToggle: boolean = false;
  showFilters: boolean = false;
  myGroup!: FormGroup;
  filterForm!: FormGroup;

  currentPage: number = 0;
  totalSize: number = 0; isLoading: boolean = true;
  fromIndex: number = 0;
  pageSize: number = 20;
  private serverMode: boolean = false;

  overdueThreshold: number = 9999; 
  escalateThreshold: number = 9999;

  lookups: any[] = [];

  constructor(
    public dialog: MatDialog, 
    private partAuditService: PartAuditService, 
    private alertService: AlertService, 
    private fb: FormBuilder,
    private lookupService: LookupService,
    private manageUserService: ManageUsersService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private api: ProcessAuditService
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');
    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    
    this.formInit();
    this.loadGridColumns();
    this.getLookups();

    this.manageUserService.getEscalation().subscribe((res: any) => {
      if (res.success && res.data) {
        const overdue = res.data.find((x: any) => x.escalationName === 'Overdue' || x.EscalationName === 'Overdue');
        if (overdue) this.overdueThreshold = parseInt(overdue.newValue || overdue.NewValue, 10);

        const escalate = res.data.find((x: any) => x.escalationName === 'Escalate' || x.EscalationName === 'Escalate');
        if (escalate) this.escalateThreshold = parseInt(escalate.newValue || escalate.NewValue, 10);
      }
      
      this.getCapas();
    });
  }

  formInit() {
    this.filterForm = this.fb.group({
      keyword: [''],
      auditParameterId: [null],
      actionType: [''],
      fromDate: [null],
      toDate: [null]
    });
  }

  clearFilters() {
    this.filterForm.reset({
      keyword: '',
      auditParameterId: null,
      actionType: '',
      fromDate: null,
      toDate: null
    });
    this.getCapas();
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
  getLookups() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.lookups = res.data.filter((x: any) => x.codeId === 8);
      }
    });
  }

  get alertsCount(): number {
    return this.originalTableList.filter(item => item.isAlert).length;
  }

  getCapas(keepPage = false) {
    if (!keepPage) {
      this.currentPage = 0;
    }
    const supplierId = this.getSupplierId();

    const filter: any = {
      ...this.filterForm.value,
      supplierId: supplierId,
      pageNumber: this.currentPage + 1,
      pageSize: this.pageSize
    };

    Object.keys(filter).forEach(key => {
      if (filter[key] === null || filter[key] === '' || filter[key] === undefined) {
        delete filter[key];
      }
    });

    this.isLoading = true;
    this.partAuditService.getAllCaps(filter).pipe(finalize(() => { this.isLoading = false; })).subscribe((res: any) => {
      if (res.success) {
        const sortedCaps = (res.data?.data || []).sort((a: any, b: any) => {
          if (b.capaId && a.capaId && b.capaId !== a.capaId) {
            return b.capaId - a.capaId;
          }
          return (b.reference || '').localeCompare(a.reference || '', undefined, { numeric: true });
        });

        this.allcaps = sortedCaps.map((capa: any) => {
          let delayVal: any = '-';
          let calculatedDelay = 0;

          if (capa.dueDate) {
            const due = new Date(capa.dueDate);
            const completion = capa.completedDate ? new Date(capa.completedDate) : new Date();
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
            ...capa,
            delayInDays: delayVal,
            calculatedDelayInDays: calculatedDelay
          };
        });

        this.totalSize = res.data.totalRecords ?? this.allcaps.length;
        this.serverMode = !!res.data?.isPaged || this.allcaps.length < this.totalSize;
        this.loadPageData();
        setTimeout(() => this.updateStickyHeader(), 50);
      }
    });
  }

  loadPageData() {
    if (this.serverMode) {
      this.tableLists = this.allcaps;
      return;
    }
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.allcaps.slice(this.fromIndex, this.fromIndex + this.pageSize);
  }

  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.serverMode) {
      this.getCapas(true);
    } else {
      this.loadPageData();
      setTimeout(() => this.updateStickyHeader(), 50);
    }
  }

  changeResolvedStatus(applicant: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: {
        component: null,
        title: 'Change Status Confirmation',
        content: `Are you sure you want to mark this record as ${applicant.isResolved ? 'Not Resolved' : 'Resolved'}?`,
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.partAuditService.updateResolvedStatus({
        partAuditCapaId: applicant.partAuditCapaId
      }).subscribe({
        next: (res: any) => {
          if (res.success) {
            applicant.isResolved = res.isResolved; 
            this.alertService.createAlert(res.message, 1);

            if (applicant.isResolved) {
              const notifPayload = {
                UserId: Number(localStorage.getItem('UserId')) || 0,
                UserType: localStorage.getItem('UserType') || 'Supplier',
                UserName: 'System Alert',
                ModuleName: 'CAPA Resolution',
                Subject: `Parts CAPA Resolved: 2026/PART/${this.padId(applicant.partAuditId)}`,
                Description: `Supplier has successfully marked Parts CAPA as Resolved. It is now pending internal review.`,
                SentToEmail: localStorage.getItem('Email') || 'admin@sqa.com'
              };
              
              this.api.sendHelpDeskMail(notifPayload).subscribe();
            }

          } else {
            this.alertService.createAlert(res.message, 0);
          }
        },
        error: () => {
          this.alertService.createAlert('Something went wrong.', 0);
        }
      });
    });
  }

  padId(id: number): string {
    return String(id).padStart(6, '0');
  }

  // --- Grid Visuals & Utilities ---

  defaultColumns: string[] = [
    'Action', 'Status', 'Resolved', 'Docs', 'Reference', 'CAPA Subject',
    'Action Type', 'Description', 'Supplier Remarks', 'Log Date',
    'Due Date', 'Delay In Days', 'Completion Date', 'Severity',
    'Occurrence', 'Detection', 'SOD Score', 'Risk Rating', 'PDCA Status'
  ];

  activeColumns: string[] = [];
  frozenCount = 0;

  getColumnWidth(column: string): number {
    const widths: { [key: string]: number } = {
      'Action': 120, 'Status': 150, 'Resolved': 110, 'Docs': 100,
      'Reference': 180, 'CAPA Subject': 220, 'Action Type': 160,
      'Description': 120, 'Supplier Remarks': 170, 'Log Date': 150,
      'Due Date': 150, 'Delay In Days': 140, 'Completion Date': 170,
      'Severity': 100, 'Occurrence': 120, 'Detection': 120,
      'SOD Score': 120, 'Risk Rating': 150, 'PDCA Status': 150
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
        userId: 1, 
        gridType: 'SupplierPartsAduitcapa',
        defaultColumns: this.defaultColumns
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
    const filter = { userId: 1, gridType: 'SupplierPartsAduitcapa' };

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
          this.cdr.detectChanges();
          setTimeout(() => this.updateStickyHeader(), 50);
        }
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

  scrollRight() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollLeft() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
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
}
