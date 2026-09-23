import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';
import { AddParameterComponent } from '../../parts-families/add-parameter/add-parameter.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { Location } from '@angular/common';
import { AddParameterforpartmasterComponent } from '../add-parameterforpartmaster/add-parameterforpartmaster.component';

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
  partMasterId: number = 0; // Initialize with a default value

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
      this.partMasterId = Number(params['partMasterId']);
      console.log(this.partMasterId, 'masterId');
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
      PartMasterId: this.partMasterId
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
    const dialogRef = this.dialog.open(AddParameterforpartmasterComponent, {
      width: '650px',
      height: 'auto',
      data: {
        partMasterId: this.partMasterId,
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
