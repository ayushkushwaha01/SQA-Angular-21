import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-process-actions-grid',
  templateUrl: './process-actions-grid.component.html',
  styleUrls: ['./process-actions-grid.component.scss']
})
export class ProcessActionsGridComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ProcessActionsGridComponent>) { }

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }

}
