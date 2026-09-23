import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-active-grid-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './active-grid-dialog.component.html',
  styleUrls: ['./active-grid-dialog.component.scss']
})
export class ActiveGridDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ActiveGridDialogComponent>) { }

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }

}
