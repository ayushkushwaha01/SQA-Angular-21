import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { SamplePopComponent } from 'src/app/pages/internal-portal/inspect-inner-screen/active-records-ref/sample-pop/sample-pop.component';
import { UploadListComponent } from 'src/app/pages/internal-portal/inspect-inner-screen/active-records-ref/upload-list/upload-list.component';
import { UploadstagepopComponent } from 'src/app/pages/internal-portal/inspect-inner-screen/active-records-ref/uploadstagepop/uploadstagepop.component';
import { ViewDocPhotosComponent } from 'src/app/pages/internal-portal/parts-audits/parts-actions/view-doc-photos/view-doc-photos.component';
import { PartsAddParameterComponent } from 'src/app/pages/internal-portal/parts-audits/parts-active-audits/parts-reference/parts-add-parameter/parts-add-parameter.component';
import { AuditrefRemarksPopComponent } from 'src/app/pages/internal-portal/parts-inner-screen/parts-audit-reference/auditref-remarks-pop/auditref-remarks-pop.component';

@Component({
  standalone: false,
  selector: 'app-ins-active-ref',
  templateUrl: './ins-active-ref.component.html',
  styleUrls: ['./ins-active-ref.component.scss']
})
export class InsActiveRefComponent implements OnInit {


  @ViewChild('tableContainer') tableContainer!: ElementRef;

  // Variables to hold the dynamic data from the route
  currentReference: string = '';
  currentPartFamily: string = '';
  currentPartName: string = '';

  constructor(
    private location: Location,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  goBack(): void {
    this.location.back();
  }

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  pagedData: any[] = [];

  // Single array of Supplier Quality Inspection Parameters
  // Note: The initial partName and partFamily values here will be overwritten dynamically
  tableData: any[] = [
    { parameter: 'OUTER DIAMETER', partName: 'Gear Shifter', partFamily: 'Engine Components', spec: '45.00', unit: 'mm', min: 44.5, max: 45.5, defectRate: '1.5%', defects: '2/150', actionLink: '1', special: 'Critical', method: 'Vernier Caliper', s1: 44.8, s2: 45.1, s3: 45.0, s4: 44.9, s5: 45.2, okay: true },
    { parameter: 'TOTAL LENGTH', partName: 'Drive Shaft', partFamily: 'Transmission', spec: '120.00', unit: 'mm', min: 119.0, max: 121.0, defectRate: '0.8%', defects: '1/120', actionLink: '2', special: 'General', method: 'Height Gauge', s1: 119.5, s2: 120.1, s3: 119.8, s4: 120.5, s5: 120.0, okay: true },
    { parameter: 'SURFACE ROUGHNESS', partName: 'Cylinder Head', partFamily: 'Engine Components', spec: '1.60', unit: 'Ra', min: 0.1, max: 1.6, defectRate: '4.2%', defects: '5/119', actionLink: '3', special: 'General', method: 'Profilometer', s1: 1.2, s2: 1.4, s3: 1.5, s4: 1.7, s5: 1.3, okay: false },
    { parameter: 'COATING THICKNESS', partName: 'Brake Caliper', partFamily: 'Braking System', spec: '18.00', unit: 'Ã‚Âµm', min: 15, max: 20, defectRate: '1.2%', defects: '1/80', actionLink: '4', special: 'General', method: 'DFT Gauge', s1: 16, s2: 18, s3: 19, s4: 15, s5: 17, okay: true },
    { parameter: 'HARDNESS', partName: 'Camshaft', partFamily: 'Engine Components', spec: '45.00', unit: 'HRC', min: 43, max: 47, defectRate: '3.1%', defects: '3/96', actionLink: '5', special: 'Critical', method: 'Rockwell Tester', s1: 44, s2: 45, s3: 46, s4: 42, s5: 45, okay: false },
    { parameter: 'CONCENTRICITY', partName: 'Rotor Assembly', partFamily: 'Braking System', spec: '0.05', unit: 'mm', min: 0.01, max: 0.05, defectRate: '1.1%', defects: '1/90', actionLink: '6', special: 'Critical', method: 'CMM', s1: 0.2, s2: 0.3, s3: 0.1, s4: 0.4, s5: 0.2, okay: true },
    { parameter: 'VISUAL INSPECTION', partName: 'Dashboard Trim', partFamily: 'Interior', spec: '1.00', unit: 'Defects', min: 1, max: 3, defectRate: '8.5%', defects: '17/200', actionLink: '7', special: 'General', method: 'Visual', s1: 1, s2: 1, s3: 2, s4: 4, s5: 1, okay: false },
    { parameter: 'THREAD GAUGE', partName: 'Mounting Bolt', partFamily: 'Fasteners', spec: '10.00', unit: 'mm', min: 9.85, max: 10.15, defectRate: '0.5%', defects: '1/200', actionLink: '8', special: 'Critical', method: 'Thread Plug', s1: 9.95, s2: 10.02, s3: 10.05, s4: 9.98, s5: 10.10, okay: true },
    { parameter: 'WEIGHT', partName: 'Connecting Rod', partFamily: 'Engine Components', spec: '250.00', unit: 'g', min: 245, max: 255, defectRate: '1.2%', defects: '2/165', actionLink: '9', special: 'General', method: 'Weighing Scale', s1: 248, s2: 251, s3: 250, s4: 249, s5: 252, okay: true },
    { parameter: 'PACKAGING INTEGRITY', partName: 'Headlight Unit', partFamily: 'Electrical', spec: '5.00', unit: 'Rating', min: 4, max: 5, defectRate: '2.0%', defects: '1/50', actionLink: '10', special: 'General', method: 'Visual', s1: 5, s2: 5, s3: 4, s4: 5, s5: 5, okay: true }
  ];

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    // Read the query parameters passed from the main grid
    this.route.queryParams.subscribe(params => {
      if (params['reference']) {
        this.currentReference = params['reference'];
      }

      if (params['partFamily'] && params['partName']) {
        this.currentPartFamily = params['partFamily'];
        this.currentPartName = params['partName'];

        // THIS IS THE KEY PART: It dynamically loops through all records and sets 
        // the partFamily and partName to exactly match the query parameters.
        this.tableData = this.tableData.map(item => ({
          ...item,
          partFamily: this.currentPartFamily,
          partName: this.currentPartName
        }));
      }

      // Load the paginated data after applying the updates
      this.updatePage();
    });
  }

  // Pagination Logic
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  private updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedData = this.tableData.slice(start, start + this.pageSize);
  }

  addchecklistaudit() {
    let dialogRef = this.dialog.open(PartsAddParameterComponent, {
      height: 'auto',
      width: '850px'
    });
    dialogRef.afterClosed().subscribe(data => { });
  }

  editParameter(item: any) {
    let dialogRef = this.dialog.open(PartsAddParameterComponent, {
      height: 'auto',
      width: '850px',
      data: item // Tells popup it's in Edit mode
    });
    dialogRef.afterClosed().subscribe(data => {
      // Handle updates if necessary
    });
  }

  opendocpop() {
    this.dialog.open(ViewDocPhotosComponent, {
      width: '600px',
      height: '450px',
    });
  }

  opennotes() {
    this.dialog.open(AuditrefRemarksPopComponent, {
      width: '500px',
      height: 'auto'
    });
  }

  deleteParameter(item: any): void {
    const confirmDelete = window.confirm('Are you sure you want to delete?');

    if (confirmDelete) {
      const index = this.tableData.indexOf(item);

      if (index > -1) {
        this.tableData.splice(index, 1);
        this.updatePage();
      }
    }
  }

  scrollTable(direction: 'left' | 'right') {
    if (this.tableContainer) {
      const container = this.tableContainer.nativeElement;
      const scrollAmount = 400; // Number of pixels to scroll per click. Adjust if needed.

      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  }

  uploadstages() {
    this.dialog.open(UploadstagepopComponent, {
      width: '800px',
      height: 'auto'
    });
  }

  openuploadpop() {
    this.dialog.open(UploadListComponent, {
      width: '600px',
      height: 'auto'
    });
  }

  opensamplepop() {
    this.dialog.open(SamplePopComponent, {
      width: '700px',
      height: 'auto'
    });
  }
}
