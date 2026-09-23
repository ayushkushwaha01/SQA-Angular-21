import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dailog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete-dailog.component.html',
  styleUrl: './delete-dailog.component.scss',
})
export class DeleteDailogComponent {
  constructor(public dialogRef: MatDialogRef<DeleteDailogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

  }

  close() {
    this.dialogRef.close();
  }

  delete() {
    this.dialogRef.close(this.data);
  }

}
