import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatIconModule],
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class ColumnSelectorComponent implements OnInit {
  columns: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ColumnSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.defaultColumns) {
      const activeCols = this.data.activeColumns || [];
      this.columns = this.data.defaultColumns.map((col: any) => {
        if (typeof col === 'string') {
          const isVis = activeCols.length > 0 ? activeCols.includes(col) : true;
          return { name: col, visible: isVis };
        } else if (typeof col === 'object' && col !== null) {
          const name = col.name || col.title || col.label || col.field || col.header || '';
          return { ...col, name: name, visible: col.visible ?? true };
        }
        return { name: String(col), visible: true };
      });
    }
  }

  selectAll(checked: boolean): void {
    this.columns.forEach(col => col.visible = checked);
  }

  save(): void {
    this.dialogRef.close(true);
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
