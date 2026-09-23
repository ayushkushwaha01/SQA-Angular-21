import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { AlertService } from 'src/app/shared/alert.service'; 
import { InspectionService } from '../../inspection.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  standalone: false,
  selector: 'app-inspection-docspop',
  templateUrl: './inspection-docspop.component.html',
  styleUrls: ['./inspection-docspop.component.scss']
})
export class InspectionDocspopComponent implements OnInit {

   documents: any[] = [];
   pagedDocs: any[] = [];
   pageSize = 5;
   pageIndex = 0;
   
   // Property to hold the incoming ID
   capaId: number;
   inspectionRefId: number;
   capaRecord: any = null;
   selectedFile: File | null = null;
   hasChanges: boolean = false;
   isReadOnly: boolean = false;

   constructor(
     public dialogRef: MatDialogRef<InspectionDocspopComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any, 
     private inspectionService: InspectionService,
     private alertService: AlertService,
     private dialog: MatDialog
   ) { 
     this.capaId = this.data.capaId;
     this.inspectionRefId = this.data.inspectionRefId;
     this.isReadOnly = this.data.isReadOnly || false;
   }
  
   ngOnInit(): void {
     this.fetchDocuments();
     this.fetchCapaRecord();
   }

   fetchCapaRecord(): void {
     if (this.inspectionRefId) {
       this.inspectionService.getCapaByInspectionRefId(this.inspectionRefId).subscribe({
         next: (res: any[]) => {
           if (res && res.length > 0) {
             this.capaRecord = res.find(c => c.Id === this.capaId || c.id === this.capaId);
           }
         },
         error: (err) => console.error("Error fetching CAPA record", err)
       });
     }
   }

   onFileSelected(event: any): void {
     if (event.target.files && event.target.files.length > 0) {
       this.selectedFile = event.target.files[0];
     } else {
       this.selectedFile = null;
     }
   }

   formatDate(dateStr: any): string | null {
     if (!dateStr) return null;
     return String(dateStr).split('T')[0];
   }

   uploadDocument(event: Event): void {
     event.preventDefault(); // Prevent default form submit action

     if (this.isReadOnly) {
       return;
     }

     if (!this.selectedFile) {
       this.alertService.createAlert('Please select a file to upload.', 0);
       return;
     }

     const payload = {
       capaId: this.capaId,
       inspectionRefId: this.inspectionRefId,
       severityId: this.capaRecord ? this.capaRecord.severityId || this.capaRecord.SeverityId : null,
       occurrence: this.capaRecord ? this.capaRecord.occurrence || this.capaRecord.Occurrence : null,
       detection: this.capaRecord ? this.capaRecord.detection || this.capaRecord.Detection : null,
       sodScore: this.capaRecord ? this.capaRecord.sodScore || this.capaRecord.SodScore : null,
       subject: this.capaRecord ? this.capaRecord.subject || this.capaRecord.Subject || '' : '',
       dueDate: this.capaRecord ? this.formatDate(this.capaRecord.dueDate || this.capaRecord.DueDate) : null,
       completedDate: this.capaRecord ? this.formatDate(this.capaRecord.completedDate || this.capaRecord.CompletedDate) : null,
       pdcaStatus: this.capaRecord ? this.capaRecord.status || this.capaRecord.Status || null : null,
       riskRating: this.capaRecord ? this.capaRecord.riskRating || this.capaRecord.RiskRating || null : null,
       class: this.capaRecord ? this.capaRecord.class || this.capaRecord.Class || null : null,
       actionType: this.capaRecord ? this.capaRecord.actionType || this.capaRecord.ActionType || null : null,
       capaSubject: this.capaRecord ? this.capaRecord.capaSubject || this.capaRecord.CapaSubject || null : null,
       observations: this.capaRecord ? this.capaRecord.observations || this.capaRecord.Observations || null : null,
       correctiveActions: this.capaRecord ? this.capaRecord.correctiveActions || this.capaRecord.CorrectiveActions || null : null,
       supplierRemarks: this.capaRecord ? this.capaRecord.supplierRemarks || this.capaRecord.SupplierRemarks || null : null,
       createdBy: 1
     };

     const sendData = new FormData();
     sendData.append('jsonData', JSON.stringify(payload));
     sendData.append('files', this.selectedFile);

     this.inspectionService.saveCapa(sendData).subscribe({
       next: (res: any) => {
         this.alertService.createAlert('Document uploaded successfully!', 1);
         this.selectedFile = null;
         this.hasChanges = true;
         
         const fileInput = document.getElementById('fileUploadInput') as HTMLInputElement;
         if (fileInput) fileInput.value = '';

         this.fetchDocuments(); // Refresh documents list in popup
       },
       error: (err) => {
         console.error("Error uploading document:", err);
         this.alertService.createAlert('Error uploading document.', 0);
       }
     });
   }

   fetchDocuments(): void {
     this.inspectionService.getCapaDocuments(this.capaId).subscribe({
       next: (res: any) => {
         if (res.success && res.data) {
           this.documents = res.data;
           this.updatePage(); // Initialize the pagination view
         }
       },
       error: (err) => {
         console.error("Error fetching documents:", err);
         this.alertService.createAlert('Error fetching documents.', 0);
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

  viewDoc(doc: any): void {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  }

  // --- NEW DELETE METHOD ---
  deleteDoc(doc: any): void {
    if (this.isReadOnly) {
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: `Are you sure you want to delete ${doc.title}?`,
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = {
          capaId: this.capaId,
          fileUrl: doc.url
        };

        this.inspectionService.deleteCapaDocument(payload).subscribe({
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
 
   // Close the dialog
   closeDialog(): void {
     this.dialogRef.close(this.hasChanges);
   }
}