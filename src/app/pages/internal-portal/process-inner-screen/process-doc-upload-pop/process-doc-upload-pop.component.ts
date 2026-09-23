import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  standalone: false,
  selector: 'app-process-doc-upload-pop',
  templateUrl: './process-doc-upload-pop.component.html',
  styleUrls: ['./process-doc-upload-pop.component.scss']
})
export class ProcessDocUploadPopComponent implements OnInit {

  docTitle: string = '';
  selectedFile: File | null = null;
  fileInputName: string = 'No file chosen';

  // Documents from API or previously added
  documents: any[] = [];
  
  // New files added in this session
  newFiles: { title: string, file: File }[] = [];

  pagedDocs: any[] = [];
  pageSize = 5;
  pageIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ProcessDocUploadPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data && this.data.documents) {
      this.documents = [...this.data.documents];
    }
    if (this.data && this.data.newFiles) {
      this.newFiles = [...this.data.newFiles];
    }
    this.updatePage();
  }

  // Handle Pagination
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  updatePage(): void {
    const allDocs = [...this.documents, ...this.newFiles.map(nf => ({ title: nf.title, isNew: true, file: nf.file }))];
    const start = this.pageIndex * this.pageSize;
    this.pagedDocs = allDocs.slice(start, start + this.pageSize);
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileInputName = this.selectedFile?.name || 'No file chosen';
    } else {
      this.fileInputName = 'No file chosen';
    }
  }

  uploadDocument(): void {
    if (this.docTitle.trim() && this.selectedFile) {
      this.newFiles.unshift({ title: this.docTitle, file: this.selectedFile });
      this.docTitle = '';
      this.selectedFile = null;
      this.fileInputName = 'No file chosen';
      
      const fileInput = document.getElementById('docFileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      this.updatePage();
    }
  }

  removeDoc(doc: any): void {
    if (doc.isNew) {
      const idx = this.newFiles.findIndex(nf => nf.file === doc.file);
      if (idx > -1) {
        this.newFiles.splice(idx, 1);
      }
    } else {
      const idx = this.documents.indexOf(doc);
      if (idx > -1) {
        this.documents.splice(idx, 1);
      }
    }
    this.updatePage();
  }

  viewDoc(doc: any): void {
    if (doc.isNew) {
      const fileURL = URL.createObjectURL(doc.file);
      window.open(fileURL, '_blank');
    } else if (doc.url) {
      window.open(doc.url, '_blank');
    }
  }

  // Close the dialog
  closeDialog(): void {
    // Only return data if user clicks 'Close' we might want to return it so they don't lose progress
    this.dialogRef.close({ documents: this.documents, newFiles: this.newFiles });
  }

}
