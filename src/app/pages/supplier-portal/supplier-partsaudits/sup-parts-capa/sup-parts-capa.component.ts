// import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { MatPaginator, PageEvent } from '@angular/material/paginator';
// import { MatDialog } from '@angular/material/dialog';
// import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
// import { EditissuesComponent } from 'src/app/editissues/editissues.component';
// import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
// import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
// import { ActionDescRemarksComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
// import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
// import { PartsActionsGridComponent } from 'src/app/pages/internal-portal/parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
// import { PartsActionsEditComponent } from 'src/app/pages/internal-portal/parts-audits/parts-actions/parts-actions-edit/parts-actions-edit.component';
// import { PartsActionsDocsComponent } from 'src/app/pages/internal-portal/parts-audits/parts-actions/parts-actions-docs/parts-actions-docs.component';
// import { ProcessActionsEditComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/process-actions-edit/process-actions-edit.component';
// import { ProcessActionsGridComponent } from 'src/app/pages/internal-portal/process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
// import { MatSort } from '@angular/material/sort';
// import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
// import { AlertService } from 'src/app/shared/alert.service';
// import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
// import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
// import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

// @Component({
//   selector: 'app-sup-parts-capa',
//   templateUrl: './sup-parts-capa.component.html',
//   styleUrls: ['./sup-parts-capa.component.scss']
// })
// export class SupPartsCapaComponent implements OnInit {



//   tableList: any[] = [];

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;
//   someElementRef: any;


//   filterToggle: boolean = false;

//   myGroup!: FormGroup;
//   originalTableList: any[] = [];
//   showFilters: boolean = false;

//   currentPage: number = 0;
//   totalSize: number = 0;
//   fromIndex: number = 0;
//   pageSize: number = 20;
//   tableLists: any[] = [];
//   constructor(public dialog: MatDialog, private partAuditService: PartAuditService, private alertService: AlertService, private fb: FormBuilder,
//     private lookupService: LookupService
//   ) { }
//   ngOnInit(): void {
//     const gridLength = localStorage.getItem('GridLength');

//     if (gridLength) {
//       this.pageSize = Number(gridLength); 
//     }
//     this.formInit();
//     this.getCapas();
//     this.loadGridColumns();
//     this.getLookups();



//   }

//   filterForm!: FormGroup;

//   formInit() {
//     this.filterForm = this.fb.group({
//       keyword: [''],
//       auditParameterId: [null],
//       actionType: [''],
//       fromDate: [null],
//       toDate: [null]
//     });
//   }
//   clearFilters() {

//     this.filterForm.reset({
//       keyword: '',
//       auditParameterId: null,
//       actionType: '',
//       fromDate: null,
//       toDate: null
//     });

//     this.getCapas();
//   }

//   lookups: any[] = [];

//   getLookups() {
//     this.lookupService.getLookups().subscribe((res: any) => {
//       if (res.success) {
//         this.lookups = res.data.filter((x: any) => x.codeId === 8);
//       }
//     });
//   }

//   // Helper getter to count total alerts dynamically
//   get alertsCount(): number {
//     return this.originalTableList.filter(item => item.isAlert).length;
//   }



//   allcaps: any[] = [];
//   getCapas() {

//     const supplierId = Number(localStorage.getItem('SupplierId')) || Number(localStorage.getItem('UserId')) || 0;

//     const filter = {
//       ...this.filterForm.value,
//       supplierId: supplierId
//     };

//     Object.keys(filter).forEach(key => {
//       if (
//         filter[key] === null ||
//         filter[key] === '' ||
//         filter[key] === undefined
//       ) {
//         delete filter[key];
//       }
//     });

//     this.partAuditService.getAllCaps(filter)
//       .subscribe((res: any) => {

//         if (res.success) {

//           this.allcaps = res.data.data;
//           this.totalSize = res.data.totalRecords;

//           this.currentPage = 0;
//           this.loadPageData();

//         }

//       });

//   }
//   loadPageData() {

//     this.fromIndex = this.currentPage * this.pageSize;

//     this.tableLists = this.allcaps.slice(
//       this.fromIndex,
//       this.fromIndex + this.pageSize
//     );

//   }
//   fnHandlePage(event: any) {

//     this.currentPage = event.pageIndex;
//     this.pageSize = event.pageSize;

//     this.loadPageData();
//   }


//   defaultColumns: string[] = [
//     'Action',
//     'Status',
//     'Resolved',
//     'Docs',
//     'Reference',
//     'CAPA Subject',
//     'Action Type',
//     'Description',
//     'Supplier Remarks',
//     'Log Date',
//     'Due Date',
//     'Delay In Days',
//     'Completion Date',
//     'Severity',
//     'Occurrence',
//     'Detection',
//     'SOD Score',
//     'Risk Rating',
//     'PDCA Status'
//   ];

//   activeColumns: string[] = [];

//   frozenCount = 0;
//   getColumnWidth(column: string): number {

//     const widths: { [key: string]: number } = {

//       'Action': 120,
//       'Status': 150,
//       'Resolved': 110,
//       'Docs': 100,
//       'Reference': 180,
//       'CAPA Subject': 220,
//       'Action Type': 160,
//       'Description': 120,
//       'Supplier Remarks': 170,
//       'Log Date': 150,
//       'Due Date': 150,
//       'Delay In Days': 140,
//       'Completion Date': 170,
//       'Severity': 100,
//       'Occurrence': 120,
//       'Detection': 120,
//       'SOD Score': 120,
//       'Risk Rating': 150,
//       'PDCA Status': 150

//     };

//     return widths[column] || 150;



//   }

//   getStickyLeft(index: number): string {

//     let left = 0;

//     for (let i = 0; i < index; i++) {

//       left += this.getColumnWidth(this.activeColumns[i]);

//     }

//     return left + 'px';

//   }


//   openColumnSelector() {

//     const dialogRef = this.dialog.open(ColumnSelectorComponent, {

//       width: '750px',

//       height: 'auto',

//       disableClose: true,

//       data: {

//         userId: 1,   // Replace with logged-in user id

//         gridType: 'SupplierPartsAduitcapa',

//         defaultColumns: this.defaultColumns

//       }

//     });

//     dialogRef.afterClosed().subscribe((didSave: boolean) => {

//       if (didSave) {

//         this.alertService.createAlert('Column layout updated successfully.');

//         this.loadGridColumns();

//       }

//     });

//   }


//   loadGridColumns() {

//     const filter = {

//       userId: 1, // Replace with logged-in user id

//       gridType: 'SupplierPartsAduitcapa'

//     };

//     this.partAuditService.getgridcolumns(filter).subscribe({

//       next: (res: any) => {

//         if (res.success && res.data) {

//           const parsedData = JSON.parse(res.data.selectedColumnsJSON);

//           // Old format support
//           if (Array.isArray(parsedData)) {

//             this.activeColumns = parsedData;
//             this.frozenCount = 0;

//           }
//           else {

//             this.activeColumns = parsedData.columns || [...this.defaultColumns];
//             this.frozenCount = parsedData.frozenCount || 0;

//           }

//         }
//         else {

//           this.activeColumns = [...this.defaultColumns];
//           this.frozenCount = 0;

//         }

//       },

//       error: (error: any) => {

//         console.error('Error loading grid columns', error);

//         this.activeColumns = [...this.defaultColumns];
//         this.frozenCount = 0;

//       }

//     });

//   }













//   // Scroll Methods
//   scrollRight() {
//     const container = document.getElementById('grid-table-container');
//     if (container) {
//       container.scrollBy({ left: 300, behavior: 'smooth' });
//     }
//   }

//   scrollLeft() {
//     const container = document.getElementById('grid-table-container');
//     if (container) {
//       container.scrollBy({ left: -300, behavior: 'smooth' });
//     }
//   }



//   changeResolvedStatus(applicant: any) {

//     const dialogRef = this.dialog.open(DialogComponent, {
//       width: 'auto',
//       data: {
//         component: null,
//         title: 'Change Status Confirmation',
//         content: `Are you sure you want to mark this record as ${applicant.isResolved ? 'Not Resolved' : 'Resolved'}?`,
//         isConfirmation: true
//       }
//     });

//     dialogRef.afterClosed().subscribe(result => {

//       if (!result) {
//         return;
//       }

//       this.partAuditService.updateResolvedStatus({
//         partAuditCapaId: applicant.partAuditCapaId
//       }).subscribe({

//         next: (res: any) => {

//           if (res.success) {
//             applicant.isResolved = res.isResolved; // update the row's state directly
//             this.alertService.createAlert(res.message, 1);
//           } else {
//             this.alertService.createAlert(res.message, 0);
//           }

//         },

//         error: () => {
//           this.alertService.createAlert('Something went wrong.', 0);
//         }

//       });

//     });

//   }
// }

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class SupPartsCapaComponent implements OnInit {

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
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 20;

  // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¥ Escalation Thresholds
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
    private api: ProcessAuditService // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¥ Needed for sendHelpDeskMail
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');
    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    
    this.formInit();
    this.loadGridColumns();
    this.getLookups();

    // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¥ Fetch Matrix FIRST, then fetch data
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

  getCapas() {
    // const supplierId = Number(localStorage.getItem('SupplierId')) || Number(localStorage.getItem('UserId')) || 0;

    const supplierId = this.getSupplierId();

    const filter = {
      ...this.filterForm.value,
      supplierId: supplierId
    };

    Object.keys(filter).forEach(key => {
      if (filter[key] === null || filter[key] === '' || filter[key] === undefined) {
        delete filter[key];
      }
    });

    this.partAuditService.getAllCaps(filter).subscribe((res: any) => {
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

          // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¥ PERMANENT DELAY CALCULATION
          if (capa.dueDate) {
            const due = new Date(capa.dueDate);
            const completion = capa.completedDate ? new Date(capa.completedDate) : new Date();
            due.setHours(0, 0, 0, 0);
            completion.setHours(0, 0, 0, 0);
            
            const diffTime = completion.getTime() - due.getTime();

            if (diffTime > 0) {
              delayVal = Math.floor(diffTime / (1000 * 3600 * 24));
              // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¥ Let the delay stay permanent for historical view!
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

        this.totalSize = res.data.totalRecords;
        this.currentPage = 0;
        this.loadPageData();
      }
    });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.allcaps.slice(this.fromIndex, this.fromIndex + this.pageSize);
  }

  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPageData();
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

            // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¥ NOTIFICATION EMAIL LOGIC
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
        }
      },
      error: (error: any) => {
        console.error('Error loading grid columns', error);
        this.activeColumns = [...this.defaultColumns];
        this.frozenCount = 0;
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
}