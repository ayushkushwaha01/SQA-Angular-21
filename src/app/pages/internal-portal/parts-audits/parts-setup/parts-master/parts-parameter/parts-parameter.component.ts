// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { MatDialog } from '@angular/material/dialog';
// import { ActivatedRoute } from '@angular/router';
// import { SetupService } from 'src/app/pages/setup/setup.service';
// import { AlertService } from 'src/app/shared/alert.service';
// import { AddParameterComponent } from '../../parts-families/add-parameter/add-parameter.component';
// import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
// import { Location } from '@angular/common';
// import { AddParameterforpartmasterComponent } from '../add-parameterforpartmaster/add-parameterforpartmaster.component';

// @Component({
//   standalone: false,
//   selector: 'app-parts-parameter',
//   templateUrl: './parts-parameter.component.html',
//   styleUrls: ['./parts-parameter.component.scss']
// })
// export class PartsParameterComponent implements OnInit {

//   currentPage: number = 0;
//   totalSize: number = 0;
//   fromIndex: number = 0;
//   pageSize: number = 5;
//   tableLists: any[] = [];

//   // Right nav state
//   isRightNavOpen: boolean = true;
//   selectedStage: string = 'Incoming';

//   addchecklistaudit() {
//     throw new Error('Method not implemented.');
//   }
//   opendocpop() {
//     throw new Error('Method not implemented.');
//   }
//   opennotes() {
//     throw new Error('Method not implemented.');
//   }
//   editParameter(_t51: any) {
//     throw new Error('Method not implemented.');
//   }


//   filterForm!: FormGroup;
//   partMasterId: number = 0; // Initialize with a default value

//   constructor(private location: Location,
//     public dialog: MatDialog, private route: ActivatedRoute, private alertService: AlertService, private _setupService: SetupService,
//     private fb: FormBuilder,
//   ) { }


//   ngOnInit(): void {
//     const gridLength = localStorage.getItem('GridLength');

//     if (gridLength) {
//       this.pageSize = Number(gridLength);
//     }

//     this.route.queryParams.subscribe(params => {
//       this.partMasterId = Number(params['partMasterId']);
//       console.log(this.partMasterId, 'masterId');
//     });
//     this.formInit();
//     this.getParameters();
//   }

//   formInit() {
//     this.filterForm = this.fb.group({
//       Keyword: [''],
//       Status: ['']
//     });
//   }

//   parameters: any[] = [];

//   getParameters() {

//     const filter = {
//       ...this.filterForm.value,
//       PartMasterId: this.partMasterId
//     };

//     this._setupService.getParameters(filter)
//       .subscribe((res: any) => {

//         if (res.success) {

//           this.parameters = res.data.data;
//           this.totalSize = res.data.toatalRecords;

//           this.tableLists = this.parameters.slice(
//             this.fromIndex,
//             this.fromIndex + this.pageSize
//           );
//         }

//       });
//   }


//   loadPageData() {
//     this.fromIndex = this.currentPage * this.pageSize;

//     this.tableLists = this.parameters.slice(
//       this.fromIndex,
//       this.fromIndex + this.pageSize
//     );
//   }
//   fnHandlePage(event: any) {

//     this.currentPage = event.pageIndex;
//     this.pageSize = event.pageSize;

//     this.loadPageData();
//   }


//   goBack(): void {
//     this.location.back();
//   }








//   addparameter(item?: any) {
//     const dialogRef = this.dialog.open(AddParameterforpartmasterComponent, {
//       width: '650px',
//       height: 'auto',
//       data: {
//         partMasterId: this.partMasterId,
//         ...item // spreads all item properties for edit
//       }
//     });

//     dialogRef.afterClosed().subscribe(() => {
//       this.getParameters();
//     });
//   }


//   deleteConfirmation(item: any) {
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
//           }
//         });
//       }
//     });
//   }

//   toggleRightNav(): void {
//     this.isRightNavOpen = !this.isRightNavOpen;
//   }

//   selectStage(stage: string): void {
//     this.selectedStage = stage;
//     this.getParameters();
//   }

// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { Location } from '@angular/common';
import { AddParameterforpartmasterComponent } from '../add-parameterforpartmaster/add-parameterforpartmaster.component';
import { forkJoin } from 'rxjs'; // 🔥 Required for concurrent API calls

@Component({
  standalone: false,
  selector: 'app-parts-parameter',
  templateUrl: './parts-parameter.component.html',
  styleUrls: ['./parts-parameter.component.scss']
})
export class PartsParameterComponent implements OnInit {

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];
  parameters: any[] = [];

  // Right nav state
  isRightNavOpen: boolean = true;
  selectedStage: string = '';
  stagesList: any[] = []; // 🔥 Added for dynamic stages

  filterForm!: FormGroup;
  partMasterId: number = 0;

  constructor(
    private location: Location,
    public dialog: MatDialog, 
    private route: ActivatedRoute, 
    private alertService: AlertService, 
    private _setupService: SetupService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');
    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    this.route.queryParams.subscribe(params => {
      this.partMasterId = Number(params['partMasterId']);
    });
    
    this.formInit();
    this.getAllStages(); // 🔥 Fetch dynamic stages on load
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }

  // --- DYNAMIC STAGES LOGIC ---
  getAllStages(): void {
    this._setupService.getAllStages().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.stagesList = res.data.filter((s: any) => s.isActive);
          
          if (this.stagesList.length > 0) {
            this.selectStage(this.stagesList[0].stageName);
          }
        }
      },
      error: () => {
        // Fallback
        this.stagesList = [
          { stageName: 'Incoming' },
          { stageName: 'First Article' },
          { stageName: 'In-Process' },
          { stageName: 'Final' },
          { stageName: 'Pre-Shipment' }
        ];
        this.selectStage('Incoming');
      }
    });
  }

  getParameters() {
    const filter = {
      ...this.filterForm.value,
      PartMasterId: this.partMasterId,
      Stage: this.selectedStage // 🔥 Filter by Stage
    };

    this._setupService.getParameters(filter).subscribe((res: any) => {
      if (res.success) {
        this.parameters = res.data.data;
        this.totalSize = res.data.toatalRecords;
        this.loadPageData();
      } else {
        this.parameters = [];
        this.totalSize = 0;
        this.loadPageData();
      }
    });
  }

  // --- LOAD PREVIOUS LOGIC ---
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
        const filter = { 
          PartMasterId: this.partMasterId, 
          Stage: previousStageName // Requesting previous stage's params
        };

        this._setupService.getParameters(filter).subscribe({
          next: (res: any) => {
            if (res.success && res.data && res.data.data && res.data.data.length > 0) {
              const previousParams = res.data.data;

              const saveRequests = previousParams.map((param: any) => {
                const copiedParam = {
                  ...param,
                  parameterId: 0, // 🔥 Set to 0 to create new record
                  stage: this.selectedStage // 🔥 Assign to current stage
                };
                return this._setupService.upsertParameter(copiedParam);
              });

              forkJoin(saveRequests).subscribe({
                next: () => {
                  this.alertService.createAlert(`Parameters copied from ${previousStageName}!`, 1);
                  this.getParameters();
                },
                error: () => {
                  this.alertService.createAlert('Error occurred while copying parameters.', 0);
                }
              });
            } else {
              this.alertService.createAlert(`Stage (${previousStageName}) has no parameters to copy.`, 0);
            }
          }
        });
      }
    });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.parameters.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }

  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPageData();
  }

  goBack(): void {
    this.location.back();
  }

  addparameter(item?: any) {
    const dialogRef = this.dialog.open(AddParameterforpartmasterComponent, {
      width: '650px',
      height: 'auto',
      data: {
        partMasterId: this.partMasterId,
        stage: this.selectedStage,
        stagesList: this.stagesList, 
        ...item
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getParameters();
    });
  }

  deleteConfirmation(item: any) {
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

  toggleRightNav(): void {
    this.isRightNavOpen = !this.isRightNavOpen;
  }

  selectStage(stage: string): void {
    this.selectedStage = stage;
    this.getParameters();
  }
}