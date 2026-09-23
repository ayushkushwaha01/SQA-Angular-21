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

@Component({
  standalone: false,
  selector: 'app-families-inner-grid',
  templateUrl: './families-inner-grid.component.html',
  styleUrls: ['./families-inner-grid.component.scss']
})
export class FamiliesInnerGridComponent implements OnInit {


  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];

  addchecklistaudit() {
    throw new Error('Method not implemented.');
  }
  opendocpop() {
    throw new Error('Method not implemented.');
  }
  opennotes() {
    throw new Error('Method not implemented.');
  }
  editParameter(_t51: any) {
    throw new Error('Method not implemented.');
  }


  filterForm!: FormGroup;
  partFamilyId: number = 0; // Initialize with a default value

  constructor(private location: Location,
    public dialog: MatDialog, private route: ActivatedRoute, private alertService: AlertService, private _setupService: SetupService,
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.route.queryParams.subscribe(params => {
      this.partFamilyId = Number(params['partFamilyId']);
      console.log(this.partFamilyId, 'familyId');
    });
    this.formInit();
    this.getParameters();
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }

  parameters: any[] = [];

  getParameters() {

    const filter = {
      ...this.filterForm.value,
      PartFamilyId: this.partFamilyId
    };

    this._setupService.getParameters(filter)
      .subscribe((res: any) => {

        if (res.success) {

          this.parameters = res.data.data;
          this.totalSize = res.data.toatalRecords;

          this.tableLists = this.parameters.slice(
            this.fromIndex,
            this.fromIndex + this.pageSize
          );
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
    const dialogRef = this.dialog.open(AddParameterComponent, {
      width: '650px',
      height: 'auto',
      data: {
        partFamilyId: this.partFamilyId,
        ...item // spreads all item properties for edit
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



}
