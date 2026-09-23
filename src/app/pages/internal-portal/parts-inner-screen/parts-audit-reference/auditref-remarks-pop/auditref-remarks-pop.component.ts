import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-auditref-remarks-pop',
  templateUrl: './auditref-remarks-pop.component.html',
  styleUrls: ['./auditref-remarks-pop.component.scss']
})
export class AuditrefRemarksPopComponent implements OnInit {

 
  notes: string = '';

  constructor(
    public dialogRef: MatDialogRef<AuditrefRemarksPopComponent>,
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
