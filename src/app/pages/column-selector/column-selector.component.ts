import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { PartAuditService } from '../internal-portal/parts-audits/part-audit.service';

export interface ColumnSelectorDialogData {
  userId: number;
  gridType: string;
  defaultColumns?: string[];
}

@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    DragDropModule
  ],
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class ColumnSelectorComponent implements OnInit {
  allAvailableColumns: string[] = [];
  selectedColumns: string[] = [];
  searchQuery: string = '';
  frozenCount: number = 0;
  currentUserId: number = 0;
  gridIdentifier: string = '';

  constructor(
    private partAuditService: PartAuditService,
    public dialogRef: MatDialogRef<ColumnSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ColumnSelectorDialogData
  ) {
    this.currentUserId = data?.userId ?? 0;
    this.gridIdentifier = data?.gridType ?? '';
    this.allAvailableColumns = data?.defaultColumns ? [...data.defaultColumns] : [];
  }

  ngOnInit(): void {
    this.loadSavedColumns();
  }

  //-----------------------------------------------------
  // Load Saved Configuration
  //-----------------------------------------------------
  loadSavedColumns() {
    const filter = {
      userId: this.currentUserId,
      gridType: this.gridIdentifier
    };

    this.partAuditService.getgridcolumns(filter)
      .subscribe({
        next: (res: any) => {
          if (res?.success && res?.data?.selectedColumnsJSON) {
            try {
              const parsed = typeof res.data.selectedColumnsJSON === 'string'
                ? JSON.parse(res.data.selectedColumnsJSON)
                : res.data.selectedColumnsJSON;

              if (Array.isArray(parsed)) {
                this.selectedColumns = parsed;
                this.frozenCount = 0;
              } else if (parsed && typeof parsed === 'object') {
                this.selectedColumns = parsed.columns || [];
                this.frozenCount = parsed.frozenCount || 0;
              } else {
                this.selectedColumns = [...this.allAvailableColumns];
                this.frozenCount = 0;
              }
            } catch (e) {
              console.error('Error parsing selected columns:', e);
              this.selectedColumns = [...this.allAvailableColumns];
              this.frozenCount = 0;
            }
          } else {
            this.selectedColumns = [...this.allAvailableColumns];
            this.frozenCount = 0;
          }
        },
        error: (err: any) => {
          console.error('Error loading grid columns:', err);
          this.selectedColumns = [...this.allAvailableColumns];
          this.frozenCount = 0;
        }
      });
  }

  //-----------------------------------------------------
  // Search
  //-----------------------------------------------------
  getFilteredColumns(): string[] {
    const query = this.searchQuery?.trim().toLowerCase();
    if (!query) {
      return this.allAvailableColumns;
    }
    return this.allAvailableColumns.filter(x =>
      x.toLowerCase().includes(query)
    );
  }

  //-----------------------------------------------------
  // Checkbox
  //-----------------------------------------------------
  toggleColumn(column: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.checked) {
      if (!this.selectedColumns.includes(column)) {
        this.selectedColumns.push(column);
      }
    } else {
      this.removeColumn(column);
    }
  }

  //-----------------------------------------------------
  // Remove
  //-----------------------------------------------------
  removeColumn(column: string) {
    this.selectedColumns = this.selectedColumns.filter(x => x !== column);

    if (this.frozenCount > this.selectedColumns.length) {
      this.frozenCount = this.selectedColumns.length;
    }
  }

  //-----------------------------------------------------
  // Selected
  //-----------------------------------------------------
  isSelected(column: string): boolean {
    return this.selectedColumns.includes(column);
  }

  //-----------------------------------------------------
  // Drag Drop
  //-----------------------------------------------------
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.selectedColumns,
      event.previousIndex,
      event.currentIndex
    );
  }

  //-----------------------------------------------------
  // Save
  //-----------------------------------------------------
  saveConfiguration() {
    const config = {
      frozenCount: this.frozenCount,
      columns: this.selectedColumns
    };

    const payload = {
      UserId: this.currentUserId,
      GridType: this.gridIdentifier,
      SelectedColumnsJSON: JSON.stringify(config)
    };

    this.partAuditService
      .upsertgridcolumns(payload)
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.dialogRef.close(true);
          }
        },
        error: (err: any) => {
          console.error('Error saving grid columns:', err);
        }
      });
  }

  //-----------------------------------------------------
  // Cancel
  //-----------------------------------------------------
  closeDialog(value: boolean = false) {
    this.dialogRef.close(value);
  }
}