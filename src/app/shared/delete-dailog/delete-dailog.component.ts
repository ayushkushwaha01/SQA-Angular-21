
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dailog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './delete-dailog.component.html',
  styleUrl: './delete-dailog.component.scss',
})
export class DeleteDailogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteDailogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void { }

  close(): void {
    this.dialogRef.close(false);
  }

  delete(): void {
    this.dialogRef.close(this.data || true);
  }
}
