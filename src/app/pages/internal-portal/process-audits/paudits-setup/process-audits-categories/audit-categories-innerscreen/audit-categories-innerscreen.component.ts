import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { ProcessAuditService } from '../../process-audit.service';
import { AddQuestionPopComponent } from './question-pop/question-pop.component';
import { ViewGuidelineComponent } from '../../view-guideline/view-guideline.component';
import { AlertService } from '../../../../../../shared/alert.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  standalone: false,
  selector: 'app-audit-categories-innerscreen',
  templateUrl: './audit-categories-innerscreen.component.html',
  styleUrls: ['./audit-categories-innerscreen.component.scss']
})
export class AuditCategoriesInnerscreenComponent implements OnInit {
  categoryId: number = 0;
  tableData: any[] = [];

  constructor(
    private dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private api: ProcessAuditService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoryId = Number(params['id']);
      this.loadQuestions();
    });
  }

  loadQuestions(): void {
    this.api.getChecklists(this.categoryId).subscribe((res: any) => {
      if (res.success) {
        this.tableData = res.data;
      }
    });
  }

  onAddQuestion(item: any): void {
    const dialogRef = this.dialog.open(AddQuestionPopComponent, {
      width: '720px',
      disableClose: true,
      data: { categoryId: this.categoryId, item: item } // Pass the FK to the popup
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.alertService.createAlert(item ? 'Question updated successfully.' : 'Question added successfully.', 1);
        this.loadQuestions();
      }
    });
  }

  viewGuideline(text: string): void {
    this.dialog.open(ViewGuidelineComponent, {
      width: '500px',
      data: text
    });
  }

  goBack() {
    this.location.back();
  }

  toggleMandatory(item: any, isChecked: boolean): void {
    item.isMandatory = isChecked;
    const payload = {
      checklistId: item.checklistId,
      processCategoryId: item.processCategoryId || this.categoryId,
      question: item.question,
      guideline: item.guideline,
      isMandatory: isChecked,
      isPriority: item.isPriority
    };
    this.api.upsertChecklist(payload).subscribe((res: any) => {
      if (res.success) {
        this.alertService.createAlert('Updated Mandatory setting', 1);
      } else {
        item.isMandatory = !isChecked;
        this.alertService.createAlert(res.message || 'Error updating setting', 0);
      }
    });
  }

  togglePriority(item: any, isChecked: boolean): void {
    item.isPriority = isChecked;
    const payload = {
      checklistId: item.checklistId,
      processCategoryId: item.processCategoryId || this.categoryId,
      question: item.question,
      guideline: item.guideline,
      isMandatory: item.isMandatory,
      isPriority: isChecked
    };
    this.api.upsertChecklist(payload).subscribe((res: any) => {
      if (res.success) {
        this.alertService.createAlert('Updated Priority setting', 1);
      } else {
        item.isPriority = !isChecked;
        this.alertService.createAlert(res.message || 'Error updating setting', 0);
      }
    });
  }


  onDelete(item: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this Question?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteChecklist(item.checklistId).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Question deleted successfully.', 1);
              this.loadQuestions(); // Refresh the grid
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete Question.', 0);
            }
          }
        });
      }
    });
  }
}