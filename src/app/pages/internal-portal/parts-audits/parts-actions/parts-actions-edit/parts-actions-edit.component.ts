import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-parts-actions-edit',
  templateUrl: './parts-actions-edit.component.html',
  styleUrls: ['./parts-actions-edit.component.scss']
})
export class PartsActionsEditComponent implements OnInit {

 
  constructor(public dialogRef: MatDialogRef<PartsActionsEditComponent>) { }
 
   ngOnInit(): void {
   }
 
   close(): void {
     this.dialogRef.close();
   }
 
   // component.ts
 selectedFiles: File[] = [];
 
 onFileSelected(event: Event): void {
   const input = event.target as HTMLInputElement;
   if (input.files) this.addFiles(input.files);
 }
 
 onDragOver(event: DragEvent): void {
   event.preventDefault();
   (event.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
 }
 
 onDragLeave(event: DragEvent): void {
   (event.currentTarget as HTMLElement).style.borderColor = '#b5b5b5';
 }
 
 onDrop(event: DragEvent): void {
   event.preventDefault();
   (event.currentTarget as HTMLElement).style.borderColor = '#b5b5b5';
   if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
 }
 
 addFiles(files: FileList): void {
   Array.from(files).forEach(f => {
     if (!this.selectedFiles.find(x => x.name === f.name))
       this.selectedFiles.push(f);
   });
 }
 
 removeFile(index: number): void {
   this.selectedFiles.splice(index, 1);
 }
 
}
