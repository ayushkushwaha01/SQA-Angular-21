import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  standalone: false,
  selector: 'app-view-doc-photos',
  templateUrl: './view-doc-photos.component.html',
  styleUrls: ['./view-doc-photos.component.scss']
})
export class ViewDocPhotosComponent implements OnInit {

  // Mock data to match the screenshot
  documents = [
    { title: 'Document check', date: '12-07-2024' }
  ];

  pagedDocs: any[] = [];
  pageSize = 5;
  pageIndex = 0;

  constructor(public dialogRef: MatDialogRef<ViewDocPhotosComponent>) { }

  ngOnInit(): void {
    this.updatePage();
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