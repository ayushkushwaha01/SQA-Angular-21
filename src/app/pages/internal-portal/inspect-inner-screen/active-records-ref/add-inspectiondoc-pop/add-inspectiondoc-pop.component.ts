import { Component, Inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { InspectionService } from '../../../inspection/inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-add-inspectiondoc-pop',
  templateUrl: './add-inspectiondoc-pop.component.html',
  styleUrls: ['./add-inspectiondoc-pop.component.scss']
})
export class AddInspectiondocPopComponent implements OnInit {
documents: any[] = [];
   pagedDocs: any[] = [];
   pageSize = 5;
   pageIndex = 0;
   
   inspectionId: number;
   selectedFile: File | null = null;
   hasChanges: boolean = false;
   isReadOnly: boolean = false;

   constructor(
     public dialogRef: MatDialogRef<AddInspectiondocPopComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any, 
     private inspectionService: InspectionService,
     private alertService: AlertService,
     private dialog: MatDialog
   ) { 
     // Fetch the InspectionId passed from the main component
     this.inspectionId = this.data.inspectionId;
     this.isReadOnly = this.data.isReadOnly || false;
   }
  
   ngOnInit(): void {
     if (this.inspectionId) {
       this.fetchDocuments();
     }
   }

   onFileSelected(event: any): void {
     if (event.target.files && event.target.files.length > 0) {
       this.selectedFile = event.target.files[0];
     } else {
       this.selectedFile = null;
     }
   }

   uploadDocument(event: Event): void {
     event.preventDefault();

     if (this.isReadOnly) return;

     if (!this.selectedFile) {
       this.alertService.createAlert('Please select a file to upload.', 0);
       return;
     }

     // Prepare FormData matching the backend request model
     const sendData = new FormData();
     sendData.append('InspectionId', this.inspectionId.toString());
     sendData.append('Files', this.selectedFile);

     this.inspectionService.uploadInspectionDocs(sendData).subscribe({
       next: (res: any) => {
         if (res.success) {
           this.alertService.createAlert('Document uploaded successfully!', 1);
           this.selectedFile = null;
           this.hasChanges = true;
           
           const fileInput = document.getElementById('fileUploadInput') as HTMLInputElement;
           if (fileInput) fileInput.value = '';

           this.fetchDocuments(); // Refresh documents list
         } else {
           this.alertService.createAlert(res.message || 'Failed to upload document.', 0);
         }
       },
       error: (err) => {
         console.error("Error uploading document:", err);
         this.alertService.createAlert('Error uploading document.', 0);
       }
     });
   }

   fetchDocuments(): void {
     this.inspectionService.getInspectionDocs(this.inspectionId).subscribe({
       next: (res: any) => {
         if (res.success && res.data) {
           this.documents = res.data;
           this.updatePage();
         }
       },
       error: (err) => {
         console.error("Error fetching documents:", err);
         this.alertService.createAlert('Error fetching documents.', 0);
       }
     });
   }
  
   onPageChange(event: PageEvent): void {
     this.pageIndex = event.pageIndex;
     this.pageSize = event.pageSize;
     this.updatePage();
   }
  
   updatePage(): void {
     const start = this.pageIndex * this.pageSize;
     this.pagedDocs = this.documents.slice(start, start + this.pageSize);
   }

  viewDoc(doc: any): void {
    if (doc.path) {
      window.open(doc.path, '_blank');
    }
  }

  deleteDoc(doc: any): void {
    if (this.isReadOnly) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: `Are you sure you want to delete ${doc.docName}?`,
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = {
          InspectionId: this.inspectionId,
          FileKey: doc.fileKey // The S3 path we got from the GET API
        };

        this.inspectionService.deleteInspectionDoc(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Document deleted successfully.', 1); 
              this.hasChanges = true;
              this.fetchDocuments(); 
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete document.', 0);
            }
          },
          error: (err) => {
            console.error("Error deleting document:", err);
            this.alertService.createAlert('Error deleting document.', 0);
          }
        });
      }
    });
  }
 
   closeDialog(): void {
     this.dialogRef.close(this.hasChanges);
   }
}
