import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ViewDocPhotosComponent } from './view-doc-photos/view-doc-photos.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { ActionDescRemarksComponent } from '../../process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { PartsActionsGridComponent } from './parts-actions-grid/parts-actions-grid.component';
import { PartsActionsEditComponent } from './parts-actions-edit/parts-actions-edit.component';
import { PartsActionsDocsComponent } from './parts-actions-docs/parts-actions-docs.component';
import { ProcessActionsEditComponent } from '../../process-audits/paudits-actions/process-actions-edit/process-actions-edit.component';
import { ProcessActionsGridComponent } from '../../process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { PartAuditService } from '../part-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';

@Component({
  standalone: false,
  selector: 'app-parts-actions',
  templateUrl: './parts-actions.component.html',
  styleUrls: ['./parts-actions.component.scss']
})
export class PartsActionsComponent implements OnInit {

  filterToggle: boolean = false;

  myGroup!: FormGroup;
  originalTableList: any[] = [];
  showFilters: boolean = false;

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 20;
  isLoading: boolean = true;
  tableLists: any[] = [];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadCAPAScreen: boolean = false;
  readonly SCREEN_ID: number = 23;
  readonly SCREEN_IDd: number = 41;

  overdueThreshold: number = 9999; 
  escalateThreshold: number = 9999;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  someElementRef: any;
  constructor(public dialog: MatDialog, private partAuditService: PartAuditService,
    private alertService: AlertService, private fb: FormBuilder, private manageUserService: ManageUsersService,
    private lookupService: LookupService
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

    this.formInit();
    this.getCapas();
    this.loadGridColumns();
    this.getLookups();

    this.manageUserService.triggerPartsEscalations().subscribe({
      next: () => console.log('Parts Escalation Matrix Executed'),
      error: (err: any) => console.error('Failed to run Parts Escalations', err)
    });

  }

  filterForm!: FormGroup;

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

  lookups: any[] = [];

  getLookups() {
    // 1. Fetch the Escalation Matrix FIRST to get both thresholds
    this.manageUserService.getEscalation().subscribe((res: any) => {
      if (res.success && res.data) {
        // Grab Overdue (for red text)
        const overdue = res.data.find((x: any) => x.escalationName === 'Overdue');
        if (overdue && overdue.newValue) {
          this.overdueThreshold = parseInt(overdue.newValue, 10);
        }

        // Grab Escalate (for the flag icon)
        const escalate = res.data.find((x: any) => x.escalationName === 'Escalate');
        if (escalate && escalate.newValue) {
          this.escalateThreshold = parseInt(escalate.newValue, 10);
        }
      }

      // 2. AFTER getting the thresholds, fetch the CAPA status dropdowns!
      this.partAuditService.getCapaStatusDD().subscribe((statusRes: any) => {
        if (statusRes.success) {
          this.lookups = statusRes.data;
        }
      });
    });
  }
  changeStatus(applicant: any) {

    const obj = {
      partAuditCapaId: applicant.partAuditCapaId,
      statusId: applicant.statusId
    };
    console.log(applicant, "all applicant dataaaa");
    this.partAuditService.updateCapaStatus(obj)
      .subscribe((res: any) => {

        if (res.success) {
          this.alertService.createAlert(res.message, 1);
          this.getCapas();
        } else {
          this.alertService.createAlert(res.message, 0);
        }

      });

  }

  allcaps: any[] = [];
  getCapas() {
    const filter = { ...this.filterForm.value };

    Object.keys(filter).forEach(key => {
      if (
        filter[key] === null ||
        filter[key] === '' ||
        filter[key] === undefined
      ) {
        delete filter[key];
      }
    });

    this.isLoading = true;
    this.partAuditService.getAllCaps(filter)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
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

              // 🔥 FIX: Calculate real delay using the exact same logic as Inspection
              if (capa.dueDate) {
                const due = new Date(capa.dueDate);
                const completion = capa.completedDate ? new Date(capa.completedDate) : new Date();
                due.setHours(0, 0, 0, 0);
                completion.setHours(0, 0, 0, 0);
                const diffTime = completion.getTime() - due.getTime();

                if (diffTime > 0) {
                  delayVal = Math.floor(diffTime / (1000 * 3600 * 24));

                  // 🔥 FIX: Check 'isResolved' (Not 'resolved') and keep flag active until checked!
                  if (!capa.isResolved) {
                    calculatedDelay = delayVal;
                  }
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
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }


  loadPageData() {

    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.allcaps.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );

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

      if (!result) {
        return;
      }

      this.partAuditService.updateResolvedStatus({
        partAuditCapaId: applicant.partAuditCapaId
      }).subscribe({

        next: (res: any) => {

          if (res.success) {
            applicant.isResolved = res.isResolved; // update the row's state directly
            this.alertService.createAlert(res.message, 1);
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

  addTests(applicant: any) {
    console.log('jkhksbdjk');
    let dialogRef = this.dialog.open(EditissuesComponent, {
      // data: id,
      height: 'auto',
      width: '5000px',
    });
    // dialogRef.afterClosed().subscribe((data: any) => {});
  }
  // deleteConfirmation(applicant: any) {
  //   console.log('Delete:', applicant);
  // }

  imageSource1() {
    this.dialog.open(ActionDescRemarksComponent, {
      width: '500px',
      height: 'auto',
    });
  }

  public addIssues(id: any) {
    console.log('jkhksbdjk');
    let dialogRef = this.dialog.open(AddIssuesssComponent, {
      data: id,
      height: 'auto',
      width: '500px',
    });
    // dialogRef.afterClosed().subscribe((data: any) => {});
  }

  public openGrid(id: any) {
    console.log('jkhksbdjk');
    let dialogRef = this.dialog.open(IssuesGridColumnsComponent, {
      data: id,
      height: 'auto',
      width: '800px',
    });
    // dialogRef.afterClosed().subscribe((data: any) => {});
  }

  tractors = [
    { TractorStatusId: 'ID-01' },
    { TractorStatusId: 'ID-02' },
    { TractorStatusId: 'ID-03' }
  ];
  TractorIdSections = [
    { item_id: 1, item_text: 'ID-01' },
    { item_id: 2, item_text: 'ID-02' },
    { item_id: 3, item_text: 'ID-03' },
  ];
  responsibleSections = [
    { item_id: 1, item_text: 'Front Axle Bracket Area' },
    { item_id: 2, item_text: 'Gearbox' },
    { item_id: 3, item_text: 'Cooling Package' },
    { item_id: 4, item_text: 'Air Intake System' },
  ];
  ORCStatuses = [
    { item_id: 1, item_text: 'O' },
    { item_id: 2, item_text: 'R1' },
    { item_id: 3, item_text: 'R2' },
    { item_id: 4, item_text: 'C' },
  ];
  Probability = [
    { item_id: 1, item_text: 'ASC' },
    { item_id: 2, item_text: 'DESC' },

  ];
  IsNew = [
    { item_id: 1, item_text: 'New' },
    { item_id: 2, item_text: 'Regular' },

  ];
  ScoreMatrix = [
    { item_id: 1, item_text: 'Assembly' },
    { item_id: 2, item_text: 'Service' },
    { item_id: 3, item_text: 'Performance' },
    { item_id: 4, item_text: 'Functional' },



  ];

  scrollRight() {
    const container = document.getElementById('grid-table-container');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  scrollLeft() {
    const container = document.getElementById('grid-table-container');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  // Component .ts file
  ;

  resSectionFilterLeads = [
    { UserId: 'U001', UserName: 'Lead A' },
    { UserId: 'U002', UserName: 'Lead B' },
    { UserId: 'U003', UserName: 'Lead C' }
  ];

  FilterSubgroup = [
    { SubGroupId: 'SG001', SubGroupName: 'Subgroup 1' },
    { SubGroupId: 'SG002', SubGroupName: 'Subgroup 2' },
    { SubGroupId: 'SG003', SubGroupName: 'Subgroup 3' }
  ];



  scorematrix = [
    { ScoreMatrixId: 'FE001', ScoreMatrixName: 'High Impact' },
    { ScoreMatrixId: 'FE002', ScoreMatrixName: 'Medium Impact' },
    { ScoreMatrixId: 'FE003', ScoreMatrixName: 'Low Impact' }
  ];

  categories = [
    { CategoryId: 'C001', CategoryName: 'Detection 1' },
    { CategoryId: 'C002', CategoryName: 'Detection 2' },
    { CategoryId: 'C003', CategoryName: 'Detection 3' }
  ];

  partsgrid() {
    this.dialog.open(PartsActionsGridComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    })
  }


  editparts() {
    this.dialog.open(PartsActionsEditComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    })
  }


  docsPhoto(applicant: any) {

    const dialogRef = this.dialog.open(PartsActionsDocsComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog',
      data: {
        auditParameterId: applicant.auditParameterId,
        partAuditId: applicant.partAuditId
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCapas();
    });

  }


  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.partAuditService.deleteCapa(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getCapas();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }


  editrow() {
    this.dialog.open(ProcessActionsEditComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    })
  }

  processgrid() {
    this.dialog.open(ProcessActionsGridComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    })
  }


  defaultColumns: string[] = [
    'Action',
    'Status',
    'Resolved',
    'Docs',
    'Reference',
    'CAPA Subject',
    'Action Type',
    'Description',
    'Supplier Remarks',
    'Log Date',
    'Due Date',
    'Delay In Days',
    'Completion Date',
    'Severity',
    'Occurrence',
    'Detection',
    'SOD Score',
    'Risk Rating',
    'PDCA Status'
  ];

  activeColumns: string[] = [];

  frozenCount = 0;
  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Action': 80,
      'Status': 150,
      'Resolved': 110,
      'Docs': 100,
      'Reference': 180,
      'CAPA Subject': 220,
      'Action Type': 160,
      'Description': 120,
      'Supplier Remarks': 170,
      'Log Date': 150,
      'Due Date': 150,
      'Delay In Days': 140,
      'Completion Date': 170,
      'Severity': 100,
      'Occurrence': 120,
      'Detection': 120,
      'SOD Score': 120,
      'Risk Rating': 150,
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

        userId: 1,   // Replace with logged-in user id

        gridType: 'PartsAduitcapa',

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

    const filter = {

      userId: 1, // Replace with logged-in user id

      gridType: 'PartsAduitcapa'

    };

    this.partAuditService.getgridcolumns(filter).subscribe({

      next: (res: any) => {

        if (res.success && res.data) {

          const parsedData = JSON.parse(res.data.selectedColumnsJSON);

          // Old format support
          if (Array.isArray(parsedData)) {

            this.activeColumns = parsedData;
            this.frozenCount = 0;

          }
          else {

            this.activeColumns = parsedData.columns || [...this.defaultColumns];
            this.frozenCount = parsedData.frozenCount || 0;

          }

        }
        else {

          this.activeColumns = [...this.defaultColumns];
          this.frozenCount = 0;

        }

      },

      error: (error) => {

        console.error('Error loading grid columns', error);

        this.activeColumns = [...this.defaultColumns];
        this.frozenCount = 0;

      }

    });

  }

  padId(id: number): string {
    return String(id).padStart(6, '0');
  }

}