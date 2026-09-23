import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { PartsAddParameterComponent } from '../../parts-audits/parts-active-audits/parts-reference/parts-add-parameter/parts-add-parameter.component';
import { AuditrefRemarksPopComponent } from '../../parts-inner-screen/parts-audit-reference/auditref-remarks-pop/auditref-remarks-pop.component';
import { ViewDocPhotosComponent } from '../../parts-audits/parts-actions/view-doc-photos/view-doc-photos.component';
import { UploadstagepopComponent } from './uploadstagepop/uploadstagepop.component';
import { UploadListComponent } from './upload-list/upload-list.component';
import { SamplePopComponent } from './sample-pop/sample-pop.component';
import { InspectionService } from '../../inspection/inspection.service';
import { AddInsParameterComponent } from './add-ins-parameter/add-ins-parameter.component';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AddInspectiondocPopComponent } from './add-inspectiondoc-pop/add-inspectiondoc-pop.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

export interface CategoryTab {
  name: string;
  code: string;
  count: number;
}

@Component({
  standalone: false,
  selector: 'app-active-records-ref',
  templateUrl: './active-records-ref.component.html',
  styleUrls: ['./active-records-ref.component.scss']
})
export class ActiveRecordsRefComponent implements OnInit {

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  currentInspectionId: number = 0;
  currentReference: string = '';
  currentPartFamily: string = '';
  currentPartName: string = '';
  isReadOnly: boolean = false;

  pageSize = 20;
  pageIndex = 0;

  tableData: any[] = [];
  pagedData: any[] = [];
  totalFilteredRecords = 0;

  // UPDATED: Now strongly typed for the new category object structure
  categories: CategoryTab[] = [];
  selectedCategory: string = ''; // Still matches by 'name' internally to minimize breaking changes
  categoryMap: { [key: string]: any } = {};
  isSupplier: boolean = false;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  canreadCAPAScreen: boolean = false;
  readonly SCREEN_ID: number = 28;
  readonly SCREEN_IDd: number = 42;

  constructor(
    private location: Location,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private inspectionService: InspectionService,
    private alertService: AlertService
  ) { }

  goBack(): void {
    this.location.back();
  }

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

    this.isSupplier = localStorage.getItem('UserType') === 'Supplier';
    this.route.queryParams.subscribe(params => {
      this.currentInspectionId = Number(params['inspectionId']);
      this.currentReference = params['reference'];
      this.currentPartFamily = params['partFamily'];
      this.currentPartName = params['partName'];
      this.isReadOnly = params['isReadOnly'] === 'true' || params['readOnly'] === 'true';

      if (this.isSupplier) {
        this.isReadOnly = true;
      }

      if (this.currentInspectionId && !isNaN(this.currentInspectionId)) {
        this.loadParameters();
      }
    });
  }

  loadParameters() {
    this.inspectionService.getInspectionParameters(this.currentInspectionId).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {

          this.categories = [];
          this.tableData = [];
          this.categoryMap = {};
          let totalOverallCount = 0;

          // Map the new nested JSON structure
          res.data.forEach((categoryGroup: any) => {
            const catName = categoryGroup.categoryName || categoryGroup.CategoryName;
            const catCode = categoryGroup.categoryCode || categoryGroup.CategoryCode || 'UNCAT';
            const count = categoryGroup.parametersCount || categoryGroup.ParametersCount || 0;

            // Prepare button data
            this.categories.push({
              name: catName,
              code: catCode,
              count: count
            });
            totalOverallCount += count;

            // Map data for create/edit tracking mapping
            if (!this.categoryMap[catName]) {
              const firstParam = categoryGroup.parameters && categoryGroup.parameters.length > 0
                ? categoryGroup.parameters[0] : null;

              this.categoryMap[catName] = {
                partId: categoryGroup.partId || categoryGroup.PartId,
                partFamilyId: firstParam ? (firstParam.partFamilyId || firstParam.PartFamilyId) : null,
                partNameId: firstParam ? (firstParam.partNameId || firstParam.PartNameId) : null
              };
            }

            // Flatten the parameters array back into a single tableData array
            if (categoryGroup.parameters && categoryGroup.parameters.length > 0) {
              categoryGroup.parameters.forEach((item: any) => {
                this.tableData.push({
                  id: item.id || item.Id,
                  parameter: item.parameter || item.Parameter,
                  categoryName: catName, // Included to allow table filtering to work
                  categoryCode: catCode,
                  spec: item.spec || item.Spec,
                  unit: item.unit || item.Unit,
                  unitId: item.unitId || item.UnitId,
                  min: item.min || item.Min,
                  max: item.max || item.Max,
                  special: item.special || item.Special,
                  defects: item.defects || item.Defects || '0',
                  defectRate: item.defectRate || item.DefectRate || '0%',
                  okay: item.okay || item.Okay,
                  capa: item.capa || item.Capa,
                  method: item.method || item.Method,
                  s1: item.s1 || item.S1,
                  s2: item.s2 || item.S2,
                  s3: item.s3 || item.S3,
                  s4: item.s4 || item.S4,
                  s5: item.s5 || item.S5,
                  remarks: item.remarks || item.Remarks
                });
              });
            }
          });

          // Ensure the currently selected category name is still valid, default to first category
          if (this.selectedCategory === 'All' || this.selectedCategory === '' || !this.categories.find(c => c.name === this.selectedCategory)) {
            if (this.categories.length > 0) {
              this.selectedCategory = this.categories[0].name;
            }
          }

          this.updatePage();
        }
      },
      error: (err) => {
        console.error('Failed to load parameters', err);
      }
    });
  }

  selectCategory(categoryName: string) {
    this.selectedCategory = categoryName;
    this.pageIndex = 0;
    this.updatePage();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  private updatePage(): void {
    const filteredData = this.selectedCategory === 'All'
      ? this.tableData
      : this.tableData.filter(x => x.categoryName === this.selectedCategory);

    this.totalFilteredRecords = filteredData.length;

    const start = this.pageIndex * this.pageSize;
    this.pagedData = filteredData.slice(start, start + this.pageSize);
  }

  addchecklistaudit() {
    if (this.isReadOnly) return;
    if (this.selectedCategory === 'All') {
      this.alertService.createAlert("Please select a specific category tab first to add a parameter to it.");
      return;
    }

    const dialogRef = this.dialog.open(AddInsParameterComponent, { height: 'auto', width: '850px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveParameterToDb(result);
      }
    });
  }

  editParameter(item: any) {
    if (this.isReadOnly) return;
    const dialogRef = this.dialog.open(AddInsParameterComponent, { height: 'auto', width: '850px', data: item });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.id = item.id;
        result.categoryName = item.categoryName;
        this.saveParameterToDb(result);
      }
    });
  }

  private saveParameterToDb(result: any) {
    const targetCategory = (this.selectedCategory === 'All' && result.categoryName)
      ? result.categoryName
      : this.selectedCategory;

    const categoryIds = this.categoryMap[targetCategory];

    const payload = {
      InspectionRefId: result.id || 0,
      InspectionId: this.currentInspectionId,
      PartId: categoryIds?.partId || null,
      PartFamilyId: categoryIds?.partFamilyId || null,
      PartNameId: categoryIds?.partNameId || null,
      ParameterName: result.parameter,
      Spec: result.spec,
      UnitId: result.unitId || null,
      Min: result.min ? result.min.toString() : null,
      Max: result.max ? result.max.toString() : null,
      Special: result.special,
      Method: result.method,
      S1: result.s1 ? result.s1.toString() : null,
      S2: result.s2 ? result.s2.toString() : null,
      S3: result.s3 ? result.s3.toString() : null,
      S4: result.s4 ? result.s4.toString() : null,
      S5: result.s5 ? result.s5.toString() : null,
      Remarks: result.remarks
    };

    this.inspectionService.addOrUpdateInspectionParameter(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.alertService.createAlert(res.message || "Parameter saved successfully!");
          this.loadParameters();
        } else {
          this.alertService.createAlert("Failed to save parameter: " + res.message);
        }
      },
      error: (err) => {
        console.error("Error saving parameter", err);
        this.alertService.createAlert("An error occurred while saving. Check console for details.");
      }
    });
  }

  deleteParameter(item: any): void {
    if (this.isReadOnly) return;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: 'Are you sure you want to delete this parameter?',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inspectionService.deleteInspectionParameter(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              const index = this.tableData.findIndex(x => x.id === item.id);
              if (index > -1) {
                this.tableData.splice(index, 1);
                // Also optionally decrement the count inside the `this.categories` loop manually, 
                // or just trigger `loadParameters()` to fetch fresh data.
                this.loadParameters();
                this.alertService.createAlert("Parameter deleted successfully.");
              }
            } else {
              this.alertService.createAlert("Failed to delete parameter: " + res.message);
            }
          },
          error: (err) => {
            console.error("Error deleting parameter", err);
            this.alertService.createAlert("An error occurred while deleting the parameter.");
          }
        });
      }
    });
  }

  opendocpop() {
    if (this.isReadOnly) return;
    this.dialog.open(AddInspectiondocPopComponent, {
      width: '600px',
      height: 'auto',
      data: {
        inspectionId: this.currentInspectionId,
        isReadOnly: this.isReadOnly
      }
    });
  }

  opennotes() { this.dialog.open(AuditrefRemarksPopComponent, { width: '500px', height: 'auto' }); }

  openuploadpop(item: any) {
    this.dialog.open(UploadListComponent, {
      width: '600px',
      height: 'auto',
      data: { id: item.id }
    });
  }

  opensamplepop() { this.dialog.open(SamplePopComponent, { width: '700px', height: 'auto' }); }

  uploadstages(item: any) {
    if (this.isReadOnly) return;
    const dialogRef = this.dialog.open(UploadstagepopComponent, {
      width: '800px',
      height: 'auto',
      data: { id: item.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadParameters();
      }
    });
  }

  scrollTable(direction: 'left' | 'right') {
    if (this.tableContainer) {
      const container = this.tableContainer.nativeElement;
      const scrollAmount = 400;
      if (direction === 'left') container.scrollLeft -= scrollAmount;
      else container.scrollLeft += scrollAmount;
    }
  }

  toggleOkay(item: any, isChecked: boolean) {
    item.okay = isChecked;

    this.inspectionService.toggleOkayStatus(item.id, isChecked).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.alertService.createAlert("Okay status updated successfully.");
        } else {
          item.okay = !isChecked;
          this.alertService.createAlert("Failed to update status: " + res.message);
        }
      },
      error: (err) => {
        item.okay = !isChecked;
        console.error("Error toggling okay status", err);
        this.alertService.createAlert("An error occurred while updating the status.");
      }
    });
  }
}