import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DefectsPopComponent } from './inspection-datatable/defects-pop/defects-pop.component';

@Component({
  selector: 'app-inspection',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss']
})
export class InspectionComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openheatmap(item: any) {
    this.dialog.open(DefectsPopComponent, {
      width: '700px',
      height: 'auto',
      data: item 
    });
  }

}
