import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ProcessAuditService } from '../../process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-process-doc-pop',
  templateUrl: './process-doc-pop.component.html',
  styleUrls: ['./process-doc-pop.component.scss']
})
export class ProcessDocPopComponent implements OnInit {

  documents: any[] = [];
  pagedDocs: any[] = [];
  pageSize = 5;
  pageIndex = 0;
  isLoading = true;

  fullCapaData: any = null;
  selectedFiles: File[] = [];

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ProcessDocPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ProcessAuditService,
    private alertService: AlertService,
    private dialog: MatDialog  
  ) { }

  ngOnInit(): void {
    this.canCreate = this.data?.canCreate !== undefined ? this.data.canCreate : (UserPermissionService.fnGetCreatePermissions(15) || UserPermissionService.fnGetCreatePermissions('CAPA'));
    this.canUpdate = this.data?.canUpdate !== undefined ? this.data.canUpdate : (UserPermissionService.fnGetUpdatePermissions(15) || UserPermissionService.fnGetUpdatePermissions('CAPA'));
    this.canDelete = this.data?.canDelete !== undefined ? this.data.canDelete : (UserPermissionService.fnGetDeletePermissions(15) || UserPermissionService.fnGetDeletePermissions('CAPA'));
    
    this.loadDocuments();
  }

  private cleanFileName(url: string): string {
    let rawName = url.split('/').pop()?.split('?')[0] || 'Document';

    if (rawName.length > 37 && rawName.charAt(36) === '_') {
      return rawName.substring(37);
    }

    return decodeURIComponent(rawName);
  }

  loadDocuments() {
    if (!this.data || !this.data.processAuditId || !this.data.checklistId) {
      this.isLoading = false;
      return;
    }

    this.api.getInnerScreenDetails(this.data.processAuditId, this.data.checklistId).subscribe((res: any) => {
      if (res.success && res.data) {
        const d = res.data;
        this.fullCapaData = d;
        this.documents = [];

        if (d.pdfDocs) {
          const pdfs = d.pdfDocs.split(',');
          pdfs.forEach((url: string) => {
            if (url.trim()) {
              this.documents.push({
                title: this.cleanFileName(url.trim()),
                date: new Date(d.createdDate || Date.now()).toLocaleDateString(),
                url: url.trim()
              });
            }
          });
        }


        if (d.imageDocs) {
          const images = d.imageDocs.split(',');
          images.forEach((url: string) => {
            if (url.trim()) {
              this.documents.push({
                title: this.cleanFileName(url.trim()),
                date: new Date(d.createdDate || Date.now()).toLocaleDateString(),
                url: url.trim()
              });
            }
          });
        }

        this.updatePage();
        this.data.docs = this.documents.length;
      }
      this.isLoading = false;
    });
  }


  onFileSelected(event: any): void {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push(event.target.files[i]);
      }
    }
    event.target.value = '';
  }


  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }


  saveDocument(): void {
    if (this.selectedFiles.length === 0 || !this.fullCapaData) return;

    const formData = new FormData();

    // We stringify the entire existing CAPA record so we don't accidentally erase remarks, dates, etc.
    formData.append('jsonData', JSON.stringify(this.fullCapaData));

    // Append the newly selected files
    this.selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    this.api.saveInnerScreenDetails(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('Document uploaded successfully!', 1);
          this.selectedFiles = []; // Clear the staging array
          this.loadDocuments(); // Refresh the grid to show the new document
        } else {
          this.alertService.createAlert(res.message || 'Failed to upload document', 0);
        }
      },
      error: () => this.alertService.createAlert('Error uploading document', 0)
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


  deleteDocument(doc: any): void {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to delete this document?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = {
          processAuditId: this.data.processAuditId,
          checklistId: this.data.checklistId,
          fileUrl: doc.url // Pass the full URL so the backend can figure out which one to delete
        };

        this.api.deleteInnerScreenDocument(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert('Document deleted successfully', 1);
              this.loadDocuments(); // 🔥 Refreshes the popup list instantly
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete document', 0);
            }
          },
          error: () => this.alertService.createAlert('Error deleting document', 0)
        });
      }
    });
  }
}