import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { PartAuditService } from '../../part-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-parts-actions-docs',
  templateUrl: './parts-actions-docs.component.html',
  styleUrls: ['./parts-actions-docs.component.scss']
})
export class PartsActionsDocsComponent implements OnInit {

  pagedDocs: any[] = [];
  pageIndex = 0;

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PartsActionsDocsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog,
    private partAuditService: PartAuditService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.canCreate = this.data?.canCreate !== undefined ? this.data.canCreate : UserPermissionService.fnGetCreatePermissions(15);
    this.canUpdate = this.data?.canUpdate !== undefined ? this.data.canUpdate : UserPermissionService.fnGetUpdatePermissions(15);
    this.canDelete = this.data?.canDelete !== undefined ? this.data.canDelete : UserPermissionService.fnGetDeletePermissions(15);

    this.getDocs();
    this.updatePage();
  }


  documents: any[] = [];
  tableLists: any[] = [];

  docTitle = '';

  selectedPdfFiles: File[] = [];

  pageSize = 5;
  currentPage = 0;
  fromIndex = 0;
  totalSize = 0;
  getDocs() {

    this.partAuditService
      .getDocs(this.data.auditParameterId)
      .subscribe((res: any) => {

        if (res.success) {

          this.documents = res.data;

          this.totalSize = res.totalRecords;

          this.loadPageData();

        }

      });

  }
  loadPageData() {

    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.documents.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );

  }
  fnHandlePage(event: any) {

    this.currentPage = event.pageIndex;

    this.pageSize = event.pageSize;

    this.loadPageData();

  }

  onPdfSelected(event: any) {

    if (event.target.files.length > 0) {

      this.selectedPdfFiles = Array.from(event.target.files);

    }

  }

  uploadDocuments() {

    if (this.selectedPdfFiles.length == 0) {
      return;
    }

    const formData = new FormData();

    formData.append('partAuditId', this.data.partAuditId);
    formData.append('auditParameterId', this.data.auditParameterId);

    formData.append('docTitle', this.docTitle);

    this.selectedPdfFiles.forEach(file => {

      formData.append('files', file);

    });

    this.partAuditService
      .upsertPartsAuditDoc(formData)
      .subscribe((res: any) => {

        if (res.success) {

          this.alertService.createAlert(res.message);

          this.docTitle = '';

          this.selectedPdfFiles = [];

          this.getDocs();

        }

      });

  }


  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.partAuditService.deleteDoc(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getDocs();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
  // Handle Pagination
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedDocs = this.documents.slice(start, start + this.pageSize);
  }

  // Close the dialog
  closeDialog(): void {
    this.dialogRef.close();
  }


}
