import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-supp-add-sample',
  templateUrl: './supp-add-sample.component.html',
  styleUrls: ['./supp-add-sample.component.scss']
})
export class SuppAddSampleComponent implements OnInit {

 
  tableData: any[] = [
    { parameter: 'OUTER DIAMETER', spec: '45.00', unit: 'mm', min: 44.5, max: 45.5, actual: '' },
    { parameter: 'TOTAL LENGTH', spec: '120.00', unit: 'mm', min: 119, max: 121, actual: '' },
    { parameter: 'SURFACE ROUGHNESS', spec: '1.60', unit: 'Ra', min: 0, max: 1.6, actual: '' },
    { parameter: 'COATING THICKNESS', spec: '18.00', unit: 'Âµm', min: 15, max: 20, actual: '' },
    { parameter: 'HARDNESS', spec: '45.00', unit: 'HRC', min: 43, max: 47, actual: '' },
    { parameter: 'CONCENTRICITY', spec: '0.05', unit: 'mm', min: 0, max: 0.05, actual: '' },
    { parameter: 'VISUAL INSPECTION', spec: '0.00', unit: 'Defects', min: 0, max: 3, actual: '' },
    { parameter: 'THREAD GAUGE', spec: '10.00', unit: 'mm', min: 9.85, max: 10.15, actual: '' },
    { parameter: 'WEIGHT', spec: '250.00', unit: 'g', min: 245, max: 255, actual: '' },
    { parameter: 'PACKAGING INTEGRITY', spec: '5.00', unit: 'Rating', min: 4, max: 5, actual: '' }
  ];

  constructor(private location:Location) { }

  ngOnInit(): void {
  }

  goback()
  {
    this.location.back();
  }

}
