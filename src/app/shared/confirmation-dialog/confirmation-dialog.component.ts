import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog-container">
      <div class="confirm-dialog-header">
        <h3 class="dialog-title">{{ data?.title || 'Delete Record' }}</h3>
      </div>

      <div class="confirm-dialog-body">
        <p class="dialog-message">{{ data?.content || 'Are you sure you want to delete this record?' }}</p>
      </div>

      <div class="confirm-dialog-actions">
        <button mat-raised-button type="button" class="btn-confirm" (click)="onConfirm()">
          {{ data?.confirmText || 'Delete' }}
        </button>
        <button type="button" mat-raised-button class="add-dark-hover btn-default" (click)="onCancel()" style="cursor: pointer;">
          <span>&nbsp;{{ data?.cancelText || 'Close' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .confirm-dialog-container {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      width: 100%;
      margin: 0;
      border-radius: 4px;
      overflow: hidden;
      box-sizing: border-box;

      .confirm-dialog-header {
        background: #c83232;
        padding: 13px 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        box-sizing: border-box;

        .dialog-title {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: #ffffff;
          line-height: normal;
          letter-spacing: 0.2px;
        }
      }

      .confirm-dialog-body {
        padding: 28px 24px 22px 24px;
        text-align: center;
        box-sizing: border-box;

        .dialog-message {
          margin: 0;
          font-size: 15px;
          color: #2c3e50;
          line-height: 1.4;
          font-weight: 400;
        }
      }

      .confirm-dialog-actions {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        padding: 0 24px 24px 24px;
        box-sizing: border-box;

        .btn-confirm {
          background-color: #c83232 !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18) !important;
          height: 38px !important;
          min-width: 88px !important;
          padding: 0 20px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          letter-spacing: 0.2px !important;
          cursor: pointer;
          transition: background-color 0.2s, box-shadow 0.2s !important;

          &:hover {
            background-color: #b52a2a !important;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.22) !important;
          }
        }

        .btn-default {
          background-color: #e0e0e0 !important;
          color: #212529 !important;
          border: 1px solid #d0d0d0 !important;
          border-radius: 4px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) !important;
          height: 38px !important;
          min-width: 88px !important;
          padding: 0 20px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          letter-spacing: 0.2px !important;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s !important;
        }

        .add-dark-hover:hover {
          background: #bfbfbf !important;
        }
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}