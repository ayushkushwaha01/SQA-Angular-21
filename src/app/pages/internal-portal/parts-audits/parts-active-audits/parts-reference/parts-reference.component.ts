import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { PartsAddParameterComponent } from './parts-add-parameter/parts-add-parameter.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewDocPhotosComponent } from '../../parts-actions/view-doc-photos/view-doc-photos.component';

@Component({
  standalone: false,
  selector: 'app-parts-reference',
  templateUrl: './parts-reference.component.html',
  styleUrls: ['./parts-reference.component.scss']
})
export class PartsReferenceComponent implements OnInit {


  constructor(
    public dialog: MatDialog,
  ) { }
  // Top Categories
  categories = [
    'Dimensional Checks (4)',
    'Surface Finish (5)',
    'Performance (3)',
    'Metallurgical (5)',
    'Mechanical (4)'
  ];
  selectedCategory = 'Dimensional Checks (4)';

  // Pagination
  pageSize = 4;
  pageIndex = 0;
  pagedData: any[] = [];

  // Table Data based  
  tableData = [
    {
      parameter: 'UTER DIAMETER', spec: '457.0±0.8', min: 23, max: 27, actionLink: 'View', special: 'General', method: 'Thermocouple',
      s1: 24.5, s2: 25.0, s3: 26.0, s4: 25.5, s5: 24.8, okay: true
    },
    {
      parameter: 'OTAL LENGTH', spec: '4.747 / 34.798', min: 6.5, max: 7.5, actionLink: 'View', special: 'General', method: 'pH Meter',
      s1: 7.1, s2: 6.9, s3: 7.2, s4: 6.8, s5: 7.0, okay: true
    },
    {
      parameter: 'WIDTH', spec: '20.0±0.2', min: 1000, max: 2000, actionLink: 'View', special: 'General', method: 'Conductivity Meter',
      s1: 1400, s2: 1500, s3: 1600, s4: 1550, s5: 1450, okay: false
    },
    {
      parameter: 'ACE TO HOLE CENTER', spec: '5.0±0.3', min: 7, max: 9, actionLink: 'View', special: 'General', method: 'DO Meter',
      s1: 8.2, s2: 7.8, s3: 8.0, s4: 7.5, s5: 8.1, okay: true
    },
    {
      parameter: 'ACE TO GROOVE CENTER', spec: '0.0±0.2', min: 0, max: 10, actionLink: 'View', special: 'General', method: 'MICROMETER',
      s1: 3.0, s2: 4.5, s3: 5.0, s4: 2.5, s5: 3.5, okay: true
    }
  ];



  ngOnInit(): void {
    this.updatePage();
  }

  // Set active category tab
  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  // Pagination Logic
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  private updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedData = this.tableData.slice(start, start + this.pageSize);
  }

    addchecklistaudit() {
      let dialogRef = this.dialog.open(PartsAddParameterComponent, {
        
        height: 'auto',
        width: '850px'
      });
      dialogRef.afterClosed().subscribe(data => {
      });
    }


    opendocpop() {
       {
    this.dialog.open(ViewDocPhotosComponent, {
      width: '600px',
      height: '450px',
      
    });
  }
}
}