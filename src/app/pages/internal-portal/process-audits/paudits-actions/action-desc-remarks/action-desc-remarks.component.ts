import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-action-desc-remarks',
  templateUrl: './action-desc-remarks.component.html',
  styleUrls: ['./action-desc-remarks.component.scss'],
 
})
export class ActionDescRemarksComponent implements OnInit {

  notes: string = '';

  constructor(
    public dialogRef: MatDialogRef<ActionDescRemarksComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; existingNotes: string }
  ) {}

  ngOnInit(): void {
    if (this.data?.existingNotes) {
      this.notes = this.data.existingNotes;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.notes);
  }

}