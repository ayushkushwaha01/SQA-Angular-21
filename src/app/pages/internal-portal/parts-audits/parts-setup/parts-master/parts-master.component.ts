import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AddPartspopComponent } from './add-partspop/add-partspop.component';
import { PartsMasterSuppliersComponent } from './parts-master-suppliers/parts-master-suppliers.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-parts-master',
  templateUrl: './parts-master.component.html',
  styleUrls: ['./parts-master.component.scss']
})
export class PartsMasterComponent implements OnInit {

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  selectedKeyword: any;




  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadCAPAScreen: boolean = false;
  readonly SCREEN_ID: number = 34;

  constructor(private dialog: MatDialog,
    private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder, private api: CommodityService
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
    this.getCommodities();
    this.getPartsMasters();
    this.getPartsFamilies();

    this.updatePage();
  }


  pageIndex = 0;

  showFilters = false;

  selectedIndustry: string = '';
  selectedStatus: string = '';

  pagedData: any[] = [];
  filteredData: any[] = [];
  filterForm!: FormGroup;
  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: [''],
      CommodityId: [null],
      partFamilyId: [null]
    });
  }
  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '', CommodityId: null, partFamilyId: null });
    this.getPartsMasters();
    this.getPartsFamilies();
  }
  // partsFamilies: any[] = [];
  // getPartsFamilies() {
  //   const userId = localStorage.getItem('UserId');
  //   const payload = {
  //     UserId: userId ? Number(userId) : null
  //   };
  //   this._setupService.getPartFamilies(payload)
  //     .subscribe((res: any) => {
  //       if (res.success) {

  //         this.partsFamilies = res.data.data;

  //       }
  //     });
  // }

  partsFamilies: any[] = [];
  
  getPartsFamilies() {
    // 🔥 ZERO TRUST FIX: Do not send UserId
    this._setupService.getPartFamilies({}) // Pass an empty object
      .subscribe((res: any) => {
        if (res.success) {
          this.partsFamilies = res.data.data;
        }
      });
  }



  originalTableData: any[] = [];
  getCommodities() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) {
        this.originalTableData = res.data;

      }
    });
  }



  partsMasters: any[] = [];
  // getPartsMasters() {
  //   const filter = { ...this.filterForm.value };

  //   Object.keys(filter).forEach(key => {
  //     if (
  //       filter[key] === null ||
  //       filter[key] === '' ||
  //       filter[key] === undefined
  //     ) {
  //       delete filter[key];
  //     }
  //   });
  //   const userId = localStorage.getItem('UserId');

  //   const Payload = {
  //     ...filter,                          // ✅ use the cleaned object
  //     UserId: userId ? Number(userId) : null
  //   };

  //   this._setupService.getPartMaster(Payload).subscribe((res: any) => {
  //     if (res.success) {

  //       this.partsMasters = res.data.data || [];
  //       this.totalSize = res.data.toatalRecords || 0;

  //       this.currentPage = 0;
  //       this.loadPageData();

  //       console.log('Total Size:', this.totalSize);
  //       console.log('Data Length:', this.partsMasters.length);
  //     }
  //   });
  // }


  getPartsMasters() {
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

    // 🔥 ZERO TRUST: Just send the filter, NO UserId!
    const Payload = { ...filter };

    this._setupService.getPartMaster(Payload).subscribe((res: any) => {
      if (res.success) {
        this.partsMasters = res.data.data || [];
        this.totalSize = res.data.toatalRecords || 0;
        this.currentPage = 0;
        this.loadPageData();
      }
    });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.partsMasters.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }
  fnHandlePage(event: any) {

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadPageData();
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

  //       this._setupService.deletePartMaster(payload).subscribe({
  //         next: (res: any) => {
  //           if (res.success) {
  //             this.alertService.createAlert(res.message, 1);
  //             this.getPartsMasters();
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
        // 🔥 ZERO TRUST: Just pass the item, NO UserId!
        const payload = { ...item };

        this._setupService.deletePartMaster(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsMasters();
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

  //       this._setupService.changeStatusPartMaster(payload).subscribe({
  //         next: (res: any) => {
  //           if (res.success) {
  //             this.alertService.createAlert(res.message, 1);
  //             this.getPartsMasters();
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
        // 🔥 ZERO TRUST: Just pass the item, NO UserId!
        const payload = { ...item };

        this._setupService.changeStatusPartMaster(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsMasters();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
  
  toggleFilters(): void {

    this.showFilters = !this.showFilters;
  }


  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.updatePage();
  }

  updatePage(): void {

    const start = this.pageIndex * this.pageSize;

    this.pagedData = this.filteredData.slice(
      start,
      start + this.pageSize
    );
  }

  scrollLeft(): void {

    this.tableContainer?.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {

    this.tableContainer?.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
  }

  addpart(data: any): void {

    const dialogRef = this.dialog.open(AddPartspopComponent, {
      width: '650px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getPartsMasters();
      }
    });

  }


  opensuppliers(item: any) {

    const dialogRef = this.dialog.open(PartsMasterSuppliersComponent, {
      width: '650px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        this.getPartsMasters();   // Refresh grid after save
      }

    });

  }
}