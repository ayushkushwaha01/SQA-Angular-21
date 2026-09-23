import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-add-vender',
  templateUrl: './add-vender.component.html',
  styleUrls: ['./add-vender.component.scss']
})
export class AddVenderComponent implements OnInit {


  ngOnInit(): void {
  }


  isEditMode: boolean = false;

  selectedCommodity: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddVenderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }



  close(): void {
    this.dialogRef.close();
  }
}
