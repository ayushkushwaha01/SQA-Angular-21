import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartsFamilypopComponent } from './add-parts-familypop/add-parts-familypop.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { PartsFamilyPopComponent } from '../defects-master/parts-family-pop/parts-family-pop.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-parts-families',
  templateUrl: './parts-families.component.html',
  styleUrls: ['./parts-families.component.scss']
})
export class PartsFamiliesComponent implements OnInit {

  showFilters: boolean = false;
  selectedCategory: string | null = null;
  selectedStatus: string = '';
  selectedKeyword: any;
  filterForm!: FormGroup;

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;

  partsFamilies: any[] = [];
  tableLists: any[] = [];

  // Variables for Defects tracking
  allDefectsMaster: any[] = [];
  totalDefectsCount: number = 0;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadCAPAScreen: boolean = false;
  readonly SCREEN_ID: number = 35;

  constructor(
    private dialog: MatDialog,
    private alertService: AlertService,
    private _setupService: SetupService,
    private fb: FormBuilder
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
    this.formInit();
    this.getAllDefectsList();
    this.getPartsFamilies();
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.getPartsFamilies();
  }

  // --- Data Fetching ---
  getAllDefectsList() {
    this._setupService.getDefects().subscribe((res: any) => {
      if (res.success) {
        this.allDefectsMaster = res.data;
        this.totalDefectsCount = this.allDefectsMaster.length;
      }
    });
  }

  // getPartsFamilies() {
  //   const userId = localStorage.getItem('UserId');

  //   const filter = {
  //     ...this.filterForm.value,
  //     UserId: userId ? Number(userId) : null
  //   };
  //   this._setupService.getPartFamilies(filter).subscribe((res: any) => {
  //     if (res.success) {

  //       this.partsFamilies = res.data.data || [];
  //       this.totalSize = res.data.toatalRecords || 0;

  //       // Reset to first page whenever data is loaded
  //       this.currentPage = 0;

  //       this.loadPageData();
  //     }
  //   });
  // }


  getPartsFamilies() {
    // 🔥 ZERO TRUST: Removed UserId logic!
    const filter = { ...this.filterForm.value };

    // Clean up empty strings so they don't clutter the URL
    Object.keys(filter).forEach(key => {
      if (filter[key] === null || filter[key] === '') {
        delete filter[key];
      }
    });

    this._setupService.getPartFamilies(filter).subscribe((res: any) => {
      if (res.success) {
        this.partsFamilies = res.data.data || [];
        this.totalSize = res.data.toatalRecords || 0;
        this.currentPage = 0;
        this.loadPageData();
      }
    });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.partsFamilies.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }

  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPageData();
  }
  // --- Defect Pop-up Logic ---
  getDefectsCount(item: any): number {
    // Check for both lowercase and uppercase 'D' just in case of C# serialization differences
    const defectsData = item.defects || item.Defects;

    if (!defectsData) return 0;

    // If the data is already an array (parsed automatically by Angular HttpClient)
    if (Array.isArray(defectsData)) return defectsData.length;

    // If the data is a raw JSON string
    try {
      const parsed = JSON.parse(defectsData);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch (e) {
      console.error("Failed to parse defects:", defectsData);
      return 0;
    }
  }

  openDefectsPopup(item: any) {
    let currentSelectedIds: number[] = [];
    const defectsData = item.defects || item.Defects;

    if (defectsData) {
      try {
        currentSelectedIds = Array.isArray(defectsData) ? defectsData : JSON.parse(defectsData);
      } catch (e) {
        currentSelectedIds = [];
      }
    }

    const dialogRef = this.dialog.open(PartsFamilyPopComponent, {
      width: '550px',
      disableClose: true,
      data: {
        fullItem: item,
        allDefects: this.allDefectsMaster,
        selectedIds: currentSelectedIds
      }
    });

    dialogRef.afterClosed().subscribe((needsRefresh: boolean) => {
      if (needsRefresh) {
        this.getPartsFamilies();
      }
    });
  }

  // --- CRUD Operations ---
  addPartFamily(data: any) {
    const dialogRef = this.dialog.open(AddPartsFamilypopComponent, {
      width: '650px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPartsFamilies();
      }
    });
  }

  // deleteConfirmation(item: any) {
  //   let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: 'auto',
  //     data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
  //   });

  //   dialogRef.afterClosed().subscribe((data: any) => {
  //     if (data) {
  //       const userId = localStorage.getItem('UserId');

  //       const payload = {
  //         ...item,
  //         UserId: userId ? Number(userId) : null
  //       };

  //       console.log('Delete Part Family Payload:', payload);
  //       this._setupService.deletePartFamily(payload).subscribe({
  //         next: (res: any) => {
  //           if (res.success) {
  //             this.alertService.createAlert(res.message, 1);
  //             this.getPartsFamilies();
  //           } else {
  //             this.alertService.createAlert(res.message, 0);
  //           }
  //         }
  //       });
  //     }
  //   });
  // }


  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        // 🔥 ZERO TRUST: Just pass the item
        const payload = { ...item };

        console.log('Delete Part Family Payload:', payload);
        this._setupService.deletePartFamily(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsFamilies();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }



  // changeStatus(item: any) {
  //   let dialogRef = this.dialog.open(DialogComponent, {
  //     width: 'auto',
  //     data: { component: null, title: 'Change Status Confirmation', content: 'Are you sure you want to change the status?', isConfirmation: true }
  //   });

  //   dialogRef.afterClosed().subscribe((data: any) => {
  //     if (data) {
  //       const userId = localStorage.getItem('UserId');

  //       const payload = {
  //         ...item,
  //         UserId: userId ? Number(userId) : null
  //       };
  //       this._setupService.changeStatusPartFamily(payload).subscribe({
  //         next: (res: any) => {
  //           if (res.success) {
  //             this.alertService.createAlert(res.message, 1);
  //             this.getPartsFamilies();
  //           } else {
  //             this.alertService.createAlert(res.message, 0);
  //           }
  //         }
  //       });
  //     }
  //   });
  // }

  changeStatus(item: any) {
    let dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Change Status Confirmation', content: 'Are you sure you want to change the status?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        // 🔥 ZERO TRUST: Just pass the item
        const payload = { ...item };
        
        console.log('Toggle Status Payload:', payload);

        this._setupService.changeStatusPartFamily(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsFamilies();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
}