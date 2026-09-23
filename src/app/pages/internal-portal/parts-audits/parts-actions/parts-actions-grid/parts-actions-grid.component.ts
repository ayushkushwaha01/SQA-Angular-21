import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-parts-actions-grid',
  templateUrl: './parts-actions-grid.component.html',
  styleUrls: ['./parts-actions-grid.component.scss']
})
export class PartsActionsGridComponent implements OnInit {

 constructor(public dialogRef: MatDialogRef<PartsActionsGridComponent>) { }

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }
}
