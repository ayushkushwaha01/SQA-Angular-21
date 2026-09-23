import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-status-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './status-confirmation-dialog.component.html',
  styleUrls: ['./status-confirmation-dialog.component.scss']
})
export class StatusConfirmationDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<StatusConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  saveInfo() {
    this.dialogRef.close(this.data);
  }
}
