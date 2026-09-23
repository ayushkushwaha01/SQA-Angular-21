import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProcessAuditService } from '../../../process-audit.service';
 
@Component({
  standalone: false,
  selector: 'app-add-question-pop',
  templateUrl: './add-question-pop.component.html'
})
export class AddQuestionPopComponent implements OnInit {
  checklistId: number = 0;
  categoryId: number = 0;
  questionText: string = '';
  guidelineText: string = '';
  isMandatory: boolean = false;
  isPriority: boolean = false;
  isEditMode: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddQuestionPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ProcessAuditService
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.data?.isEdit;
    this.categoryId = this.data?.categoryId; // The FK passed from the grid
  }

  onSave(): void {
    const payload = {
      checklistId: this.checklistId,
      processCategoryId: this.categoryId, // Saving against specific category
      question: this.questionText,
      guideline: this.guidelineText,
      isMandatory: this.isMandatory, 
      isPriority: this.isPriority
    };
    
    this.api.upsertChecklist(payload).subscribe((res: any) => {
      if(res.success) this.dialogRef.close(true);
    });
  }
  
  onCancel(): void { this.dialogRef.close(); }
}