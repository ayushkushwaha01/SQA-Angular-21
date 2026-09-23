import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProcessAuditService } from '../../../process-audit.service';
 
@Component({
  standalone: false,
  selector: 'question-pop.component',
  templateUrl: './question-pop.component.html',
  styleUrls: ['./question-pop.component.scss']
})

export class AddQuestionPopComponent implements OnInit {
  categoryId: number = 0;
  checklistId: number = 0;
  isEditMode: boolean = false;
  questionForm: FormGroup;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddQuestionPopComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ProcessAuditService
  ) {
    // 1. Initialize the Reactive Form
    this.questionForm = this.fb.group({
      questionText: ['', Validators.required],
      guidelineText: [''],
      isMandatory: [false],
      isPriority: [false]
    });
  }

  ngOnInit(): void {
    this.categoryId = this.data.categoryId; // FK always passed in

    if (this.data.item) {
      this.isEditMode = true;
      this.checklistId = this.data.item.checklistId;
      
      // 2. Patch values if in Edit Mode
      this.questionForm.patchValue({
        questionText: this.data.item.question,
        guidelineText: this.data.item.guideline,
        isMandatory: this.data.item.isMandatory,
        isPriority: this.data.item.isPriority
      });
    }
  }

  onSave(): void {
    if (this.questionForm.valid) {
      const payload = {
        checklistId: this.checklistId,
        processCategoryId: this.categoryId, 
        question: this.questionForm.value.questionText,
        guideline: this.questionForm.value.guidelineText,
        isMandatory: this.questionForm.value.isMandatory,
        isPriority: this.questionForm.value.isPriority
      };

      this.api.upsertChecklist(payload).subscribe((res: any) => {
        if(res.success) {
          this.dialogRef.close(true);
        }
      });
    } else {
      this.questionForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}