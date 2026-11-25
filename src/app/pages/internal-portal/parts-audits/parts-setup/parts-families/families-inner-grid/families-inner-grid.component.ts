// import { Location } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { PageEvent } from '@angular/material/paginator';
// import { ActivatedRoute } from '@angular/router';
// import { AlertService } from 'src/app/shared/alert.service';
// import { SetupService } from 'src/app/pages/setup/setup.service';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
// import { AddParameterComponent } from '../add-parameter/add-parameter.component';
// import { DownloadExcelService } from 'src/app/shared/download-excel.service';

// @Component({
//   standalone: false,
//   selector: 'app-families-inner-grid',
//   templateUrl: './families-inner-grid.component.html',
//   styleUrls: ['./families-inner-grid.component.scss']
// })
// export class FamiliesInnerGridComponent implements OnInit {

//   // Right Nav State
//   isRightNavOpen: boolean = true;
//   selectedStage: string = 'Incoming';

//   // Pagination & Lists
//   currentPage: number = 0;
//   totalSize: number = 0;
//   fromIndex: number = 0;
//   pageSize: number = 10;
//   tableLists: any[] = [];
//   parameters: any[] = [];
//   filterForm!: FormGroup;
//   partFamilyId: number = 0;

//   // --- STAGE DATA FALLBACKS ---
//   stageDatasets: { [key: string]: any[] } = {
//     'Incoming': [
//       { parameter: 'OUTER DIAMETER', spec: '457.0±0.8 mm', min: 456.2, max: 457.8, method: 'Thermocouple', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'TOTAL LENGTH', spec: '34.75±0.05 mm', min: 34.70, max: 34.80, method: 'Vernier Caliper', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'MATERIAL HARDNESS', spec: '45-50 HRC', min: 45, max: 50, method: 'Hardness Tester', category: 'Mechanical', unit: 'HRC' },
//       { parameter: 'TENSILE STRENGTH', spec: '> 400 MPa', min: 400, max: 600, method: 'Tensile Tester', category: 'Mechanical', unit: 'MPa' },
//       { parameter: 'ALLOY COMPOSITION (CARBON)', spec: '0.4% - 0.5%', min: 0.4, max: 0.5, method: 'Spectrometry', category: 'Chemical', unit: '%' },
//       { parameter: 'RAW WEIGHT', spec: '5.0±0.2 kg', min: 4.8, max: 5.2, method: 'Weighing Scale', category: 'Dimensional', unit: 'kg' },
//       { parameter: 'SURFACE DEFECTS', spec: '< 2 sq mm', min: 0, max: 2, method: 'Visual / Microscope', category: 'Visual', unit: 'sq mm' },
//       { parameter: 'RUST LEVEL', spec: 'Grade 0', min: 0, max: 0, method: 'Visual Inspection', category: 'Visual', unit: '-' },
//       { parameter: 'THREAD PITCH', spec: '1.5±0.05 mm', min: 1.45, max: 1.55, method: 'Thread Gauge', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'ROUNDNESS', spec: '< 0.05 mm', min: 0, max: 0.05, method: 'CMM', category: 'Dimensional', unit: 'mm' }
//     ],
//     'First Article': [
//       { parameter: 'INITIAL PROTOTYPE WEIGHT', spec: '1250±10 g', min: 1240, max: 1260, method: 'Precision Scale', category: 'Dimensional', unit: 'g' },
//       { parameter: 'FIRST MOLD DIMENSION X', spec: '100.0±0.1 mm', min: 99.9, max: 100.1, method: 'CMM', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'FIRST MOLD DIMENSION Y', spec: '50.0±0.1 mm', min: 49.9, max: 50.1, method: 'CMM', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'WALL THICKNESS', spec: '3.0±0.05 mm', min: 2.95, max: 3.05, method: 'Ultrasonic Gauge', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'HOLE POSITION X', spec: '15.0±0.02 mm', min: 14.98, max: 15.02, method: 'CMM', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'SNAP FIT TOLERANCE', spec: '0.5±0.01 mm', min: 0.49, max: 0.51, method: 'Feeler Gauge', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'VISUAL FLASH', spec: 'Zero Tolerance', min: 0, max: 0, method: 'Visual', category: 'Visual', unit: '-' },
//       { parameter: 'GATE RESIDUE', spec: '< 0.2 mm', min: 0, max: 0.2, method: 'Vernier Caliper', category: 'Dimensional', unit: 'mm' }
//     ],
//     'In-Process': [
//       { parameter: 'INNER DIAMETER', spec: '400.0±0.5 mm', min: 399.5, max: 400.5, method: 'Bore Gauge', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'THICKNESS', spec: '15.0±0.1 mm', min: 14.9, max: 15.1, method: 'Micrometer', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'SURFACE ROUGHNESS (Ra)', spec: '< 3.2 µm', min: 0, max: 3.2, method: 'Profilometer', category: 'Dimensional', unit: 'µm' },
//       { parameter: 'COOLANT TEMPERATURE', spec: '60±5 °C', min: 55, max: 65, method: 'Temp Sensor', category: 'Dimensional', unit: '°C' },
//       { parameter: 'MACHINING SPEED', spec: '1500±50 RPM', min: 1450, max: 1550, method: 'Tachometer', category: 'Dimensional', unit: 'RPM' },
//       { parameter: 'FEED RATE', spec: '0.2±0.02 mm/rev', min: 0.18, max: 0.22, method: 'CNC Readout', category: 'Dimensional', unit: 'mm/rev' },
//       { parameter: 'TOOL WEAR', spec: '< 0.1 mm', min: 0, max: 0.1, method: 'Optical Presetter', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'CYCLE TIME', spec: '45±2 sec', min: 43, max: 47, method: 'Stopwatch', category: 'Dimensional', unit: 'sec' }
//     ],
//     'Final': [
//       { parameter: 'PART WEIGHT', spec: '1250±50 g', min: 1200, max: 1300, method: 'Weighing Scale', category: 'Dimensional', unit: 'g' },
//       { parameter: 'FINAL MATERIAL HARDNESS', spec: '48±2 HRC', min: 46, max: 50, method: 'Hardness Tester', category: 'Dimensional', unit: 'HRC' },
//       { parameter: 'FINAL COATING THICKNESS', spec: '2.0±0.2 mm', min: 1.8, max: 2.2, method: 'Coating Gauge', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'PAINT ADHESION', spec: 'Cross-Cut 5B', min: 5, max: 5, method: 'Tape Test', category: 'Dimensional', unit: '-' },
//       { parameter: 'CORROSION RESISTANCE', spec: '> 72 hrs SST', min: 72, max: 100, method: 'Salt Spray Tester', category: 'Dimensional', unit: 'hrs' },
//       { parameter: 'ELECTRICAL CONTINUITY', spec: '< 0.1 Ohm', min: 0, max: 0.1, method: 'Multimeter', category: 'Dimensional', unit: 'Ohm' },
//       { parameter: 'INSULATION RESISTANCE', spec: '> 100 MOhm', min: 100, max: 500, method: 'Megohmmeter', category: 'Dimensional', unit: 'MOhm' },
//       { parameter: 'FUNCTIONAL TEST (ACTUATION)', spec: '5.0±0.5 N', min: 4.5, max: 5.5, method: 'Force Gauge', category: 'Dimensional', unit: 'N' },
//       { parameter: 'LEAKAGE TEST', spec: '< 1 cc/min @ 5 bar', min: 0, max: 1, method: 'Leak Tester', category: 'Dimensional', unit: 'cc/min' }
//     ],
//     'Pre-Shipment': [
//       { parameter: 'PACKAGING INTEGRITY', spec: 'Sealed & Labeled', min: 1, max: 1, method: 'Visual Inspection', category: 'Dimensional', unit: '-' },
//       { parameter: 'BARCODE READABILITY', spec: '100% Scan Rate', min: 100, max: 100, method: 'Barcode Scanner', category: 'Dimensional', unit: '%' },
//       { parameter: 'BOX WEIGHT', spec: '25±0.5 kg', min: 24.5, max: 25.5, method: 'Floor Scale', category: 'Dimensional', unit: 'kg' },
//       { parameter: 'PALLET DIMENSIONS', spec: '1200x800x1500 mm', min: 0, max: 0, method: 'Measuring Tape', category: 'Dimensional', unit: 'mm' },
//       { parameter: 'QUANTITY PER BOX', spec: '20 Units', min: 20, max: 20, method: 'Count', category: 'Dimensional', unit: 'Units' },
//       { parameter: 'LABEL PLACEMENT', spec: 'Top Right Corner', min: 1, max: 1, method: 'Visual', category: 'Dimensional', unit: '-' },
//       { parameter: 'DROP TEST', spec: 'Pass at 1m', min: 1, max: 1, method: 'Drop Tester', category: 'Dimensional', unit: '-' }
//     ]
//   };

//   constructor(
//     private location: Location,
//     public dialog: MatDialog,
//     private route: ActivatedRoute,
//     private alertService: AlertService,
//     private _setupService: SetupService,
//     private fb: FormBuilder,
//     private downLoadExcelService: DownloadExcelService
//   ) { }

//   ngOnInit(): void {
//     const gridLength = localStorage.getItem('GridLength');

//     if (gridLength) {
//       this.pageSize = Number(gridLength);
//     }
//     this.route.queryParams.subscribe(params => {
//       this.partFamilyId = Number(params['partFamilyId']);
//       console.log(this.partFamilyId, 'familyId');
//     });
//     this.formInit();
//     this.selectStage('Incoming');
//   }

//   formInit() {
//     this.filterForm = this.fb.group({
//       Keyword: [''],
//       Status: ['']
//     });
//   }

//   // --- RIGHT NAV LOGIC ---
//   toggleRightNav(): void {
//     this.isRightNavOpen = !this.isRightNavOpen;
//   }

//   selectStage(stage: string): void {
//     this.selectedStage = stage;
//     this.currentPage = 0;
//     this.getParameters();
//   }

//   getParameters(): void {
//     const filter = {
//       ...this.filterForm.value,
//       PartFamilyId: this.partFamilyId,
//       Stage: this.selectedStage
//     };

//     this._setupService.getParameters(filter).subscribe({
//       next: (res: any) => {
//         if (res.success && res.data && res.data.data && res.data.data.length > 0) {
//           this.parameters = res.data.data;
//           this.totalSize = res.data.toatalRecords || this.parameters.length;
//         } else {
//           // Stage dataset fallback if no API parameters yet for selected stage
//           this.parameters = this.stageDatasets[this.selectedStage] || [];
//           this.totalSize = this.parameters.length;
//         }
//         this.loadPageData();
//       },
//       error: () => {
//         // Fallback to stage dataset on error
//         this.parameters = this.stageDatasets[this.selectedStage] || [];
//         this.totalSize = this.parameters.length;
//         this.loadPageData();
//       }
//     });
//   }

//   loadPrevious(): void {
//     this.alertService.createAlert('Previous parameters loaded successfully', 1);
//     this.getParameters();
//   }

//   downloadTemplate(): void {
//     const exportData = (this.parameters.length > 0 ? this.parameters : this.stageDatasets[this.selectedStage]).map((item: any) => ({
//       Category: item.categoryName || item.category || '-',
//       Parameter: item.parmeterName || item.parameter || '-',
//       Unit: item.unitName || item.unit || '-',
//       Spec: item.spec || '-',
//       Min: item.min || 0,
//       Max: item.max || 0,
//       Method: item.method || '-'
//     }));
//     this.downLoadExcelService.exportAsExcelFile(exportData, `Parameter_Template_${this.selectedStage.replace(/\s+/g, '_')}`);
//   }

//   loadPageData(): void {
//     this.fromIndex = this.currentPage * this.pageSize;
//     this.tableLists = this.parameters.slice(
//       this.fromIndex,
//       this.fromIndex + this.pageSize
//     );
//   }

//   fnHandlePage(event: PageEvent): void {
//     this.currentPage = event.pageIndex;
//     this.pageSize = event.pageSize;
//     this.loadPageData();
//   }

//   goBack(): void {
//     this.location.back();
//   }

//   addparameter(item?: any): void {
//     const dialogRef = this.dialog.open(AddParameterComponent, {
//       width: '650px',
//       height: 'auto',
//       data: {
//         partFamilyId: this.partFamilyId,
//         stage: this.selectedStage,
//         ...item
//       }
//     });

//     dialogRef.afterClosed().subscribe(() => {
//       this.getParameters();
//     });
//   }

//   deleteConfirmation(item: any): void {
//     let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
//       width: 'auto',
//       data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
//     });

//     dialogRef.afterClosed().subscribe((data: any) => {
//       if (data) {
//         this._setupService.deleteParameter(item).subscribe({
//           next: (res: any) => {
//             if (res.success) {
//               this.alertService.createAlert(res.message, 1);
//               this.getParameters();
//             } else {
//               this.alertService.createAlert(res.message, 0);
//             }
//           },
//           error: () => {
//             // Local fallback deletion for mock stage items
//             this.parameters = this.parameters.filter(p => p !== item);
//             this.totalSize = this.parameters.length;
//             this.loadPageData();
//             this.alertService.createAlert('Parameter deleted', 1);
//           }
//         });
//       }
//     });
//   }

// }



import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AddParameterComponent } from '../add-parameter/add-parameter.component';
import { DownloadExcelService } from 'src/app/shared/download-excel.service';
import { forkJoin } from 'rxjs'; 

@Component({
  standalone: false,
  selector: 'app-families-inner-grid',
  templateUrl: './families-inner-grid.component.html',
  styleUrls: ['./families-inner-grid.component.scss']
})
export class FamiliesInnerGridComponent implements OnInit {
  isRightNavOpen: boolean = true;
  selectedStage: string = '';
  stagesList: any[] = []; 

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 10;
  tableLists: any[] = [];
  parameters: any[] = [];
  filterForm!: FormGroup;
  partFamilyId: number = 0;

  constructor(
    private location: Location,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private _setupService: SetupService,
    private fb: FormBuilder,
    private downLoadExcelService: DownloadExcelService
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');
    if (gridLength) this.pageSize = Number(gridLength);

    this.route.queryParams.subscribe(params => {
      this.partFamilyId = Number(params['partFamilyId']);
    });
    
    this.formInit();
    this.getAllStages(); 
  }

  formInit() {
    this.filterForm = this.fb.group({ Keyword: [''], Status: [''] });
  }

  toggleRightNav(): void { this.isRightNavOpen = !this.isRightNavOpen; }

  getAllStages(): void {
    this._setupService.getAllStages().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.stagesList = res.data.filter((s: any) => s.isActive);
          if (this.stagesList.length > 0) this.selectStage(this.stagesList[0].stageName);
        }
      },
      error: () => this.alertService.createAlert('Failed to load stages', 0)
    });
  }

  selectStage(stage: string): void {
    this.selectedStage = stage;
    this.currentPage = 0;
    this.getParameters();
  }

  getParameters(): void {
    const filter = {
      ...this.filterForm.value,
      PartFamilyId: this.partFamilyId,
      Stage: this.selectedStage // 🔥 Filtering data per stage
    };

    this._setupService.getParameters(filter).subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.data) {
          this.parameters = res.data.data;
          this.totalSize = res.data.toatalRecords || this.parameters.length;
        } else {
          this.parameters = [];
          this.totalSize = 0;
        }
        this.loadPageData();
      },
      error: () => {
        this.parameters = [];
        this.totalSize = 0;
        this.loadPageData();
      }
    });
  }

  loadPrevious(): void {
    if (this.parameters.length > 0) {
      this.alertService.createAlert(`The ${this.selectedStage} stage already has parameters.`, 0);
      return;
    }

    const currentIndex = this.stagesList.findIndex(s => s.stageName === this.selectedStage);
    if (currentIndex <= 0) {
      this.alertService.createAlert('No previous stage available to copy from.', 0);
      return;
    }

    const previousStageName = this.stagesList[currentIndex - 1].stageName;

    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { 
        component: null, 
        title: 'Load Previous Confirmation', 
        content: `Are you sure you want to load parameters from ${previousStageName}?`, 
        isConfirmation: true,
        type: 'info',
        confirmText: 'Load',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const filter = { PartFamilyId: this.partFamilyId, Stage: previousStageName };

        this._setupService.getParameters(filter).subscribe({
          next: (res: any) => {
            if (res.success && res.data && res.data.data && res.data.data.length > 0) {
              const previousParams = res.data.data;

              const saveRequests = previousParams.map((param: any) => {
                const copiedParam = {
                  ...param,
                  parameterId: 0, 
                  stage: this.selectedStage // 🔥 Tag with current stage
                };
                return this._setupService.upsertParameter(copiedParam);
              });

              forkJoin(saveRequests).subscribe({
                next: () => {
                  this.alertService.createAlert(`Parameters copied from ${previousStageName}!`, 1);
                  this.getParameters(); 
                },
                error: () => this.alertService.createAlert('Error occurred while copying.', 0)
              });
            } else {
              this.alertService.createAlert(`Stage (${previousStageName}) has no parameters to copy.`, 0);
            }
          }
        });
      }
    });
  }

  downloadTemplate(): void {
    const exportData = this.parameters.map((item: any) => ({
      Category: item.categoryName || item.category || '-',
      Parameter: item.parmeterName || item.parameter || '-',
      Unit: item.unitName || item.unit || '-',
      Spec: item.spec || '-',
      Min: item.min || 0,
      Max: item.max || 0,
      Method: item.method || '-'
    }));
    this.downLoadExcelService.exportAsExcelFile(exportData, `Parameter_Template_${this.selectedStage.replace(/\s+/g, '_')}`);
  }

  loadPageData(): void {
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.parameters.slice(this.fromIndex, this.fromIndex + this.pageSize);
  }

  fnHandlePage(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPageData();
  }

  goBack(): void { this.location.back(); }

  addparameter(item?: any): void {
    const dialogRef = this.dialog.open(AddParameterComponent, {
      width: '650px',
      height: 'auto',
      data: {
        partFamilyId: this.partFamilyId,
        stage: this.selectedStage,  
        stagesList: this.stagesList,
        ...item
      }
    });

    dialogRef.afterClosed().subscribe(() => this.getParameters());
  }

  deleteConfirmation(item: any): void {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this._setupService.deleteParameter(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getParameters();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
}