import { Component, OnInit } from '@angular/core';
import { ViewDocPhotosComponent } from '../../parts-audits/parts-actions/view-doc-photos/view-doc-photos.component';
import { PartsAddParameterComponent } from '../../parts-audits/parts-active-audits/parts-reference/parts-add-parameter/parts-add-parameter.component';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AuditrefRemarksPopComponent } from '../parts-audit-reference/auditref-remarks-pop/auditref-remarks-pop.component';

@Component({
  standalone: false,
  selector: 'app-parts-completed-reference',
  templateUrl: './parts-completed-reference.component.html',
  styleUrls: ['./parts-completed-reference.component.scss']
})
export class PartsCompletedReferenceComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private location: Location
  ) { }

  goBack(): void {
    this.location.back();
  }

  // Top Categories (Updated to match the 12 records)
  categories: string[] = [
    'Dimensional Checks (12)',
    'Surface Finish (12)',
    'Performance (12)',
    'Metallurgical (12)',
    'Mechanical (12)'
  ];
  selectedCategory = 'Dimensional Checks (12)';

  // Pagination (Updated to 10 by default)
  pageSize = 10;
  pageIndex = 0;
  pagedData: any[] = [];
  tableData: any[] = []; 

  // Dictionary holding unique parameters for EACH category
  categoryData: { [key: string]: any[] } = {
    'Dimensional Checks (12)': [
      { parameter: 'OUTER DIAMETER', spec: '457.0±0.8', min: 23, max: 27, actionLink: '8', special: 'General', method: 'Thermocouple', s1: 24.5, s2: 25.0, s3: 26.0, s4: 25.5, s5: 24.8, okay: true },
      { parameter: 'TOTAL LENGTH', spec: '4.747 / 34.798', min: 6.5, max: 7.5, actionLink: '11', special: 'General', method: 'pH Meter', s1: 7.1, s2: 6.9, s3: 7.2, s4: 6.8, s5: 7.0, okay: true },
      { parameter: 'WIDTH', spec: '20.0±0.2', min: 1000, max: 2000, actionLink: '12', special: 'General', method: 'Conductivity Meter', s1: 1400, s2: 1500, s3: 1600, s4: 1550, s5: 1450, okay: false },
      { parameter: 'HOLE CENTER', spec: '5.0±0.3', min: 7, max: 9, actionLink: '3', special: 'General', method: 'DO Meter', s1: 8.2, s2: 7.8, s3: 8.0, s4: 7.5, s5: 8.1, okay: false },
      { parameter: 'INNER DIAMETER', spec: '400.0±0.5', min: 399.5, max: 400.5, actionLink: '16', special: 'Critical', method: 'Bore Gauge', s1: 400.1, s2: 399.8, s3: 400.0, s4: 400.2, s5: 399.9, okay: true },
      { parameter: 'CONCENTRICITY', spec: '0.05 Max', min: 0, max: 0.05, actionLink: '17', special: 'Critical', method: 'CMM', s1: 0.02, s2: 0.03, s3: 0.01, s4: 0.04, s5: 0.02, okay: true },
      { parameter: 'FLATNESS', spec: '0.1 Max', min: 0, max: 0.1, actionLink: '18', special: 'General', method: 'Surface Plate', s1: 0.05, s2: 0.08, s3: 0.06, s4: 0.12, s5: 0.04, okay: false },
      { parameter: 'PARALLELISM', spec: '0.05 Max', min: 0, max: 0.05, actionLink: '19', special: 'General', method: 'Dial Indicator', s1: 0.03, s2: 0.02, s3: 0.04, s4: 0.03, s5: 0.01, okay: true },
      { parameter: 'PERPENDICULARITY', spec: '0.08 Max', min: 0, max: 0.08, actionLink: '110', special: 'General', method: 'Squareness Tester', s1: 0.06, s2: 0.07, s3: 0.05, s4: 0.09, s5: 0.04, okay: false },
      { parameter: 'RUNOUT', spec: '0.02 Max', min: 0, max: 0.02, actionLink: '111', special: 'Critical', method: 'CMM', s1: 0.01, s2: 0.015, s3: 0.012, s4: 0.018, s5: 0.011, okay: true },
      { parameter: 'TRUE POSITION', spec: '0.1 Max', min: 0, max: 0.1, actionLink: '112', special: 'Critical', method: 'Vision System', s1: 0.05, s2: 0.08, s3: 0.06, s4: 0.04, s5: 0.07, okay: true },
      { parameter: 'WALL THICKNESS', spec: '5.0±0.1', min: 4.9, max: 5.1, actionLink: '113', special: 'General', method: 'Ultrasonic', s1: 4.95, s2: 5.05, s3: 5.00, s4: 4.98, s5: 5.12, okay: false }
    ],
    'Surface Finish (12)': [
      { parameter: 'ROUGHNESS (Ra)', spec: '1.6 µm', min: 1.2, max: 1.8, actionLink: '7', special: 'Critical', method: 'Profilometer', s1: 1.4, s2: 1.5, s3: 1.7, s4: 1.6, s5: 1.5, okay: true },
      { parameter: 'PEAK COUNT (Rpc)', spec: '60/cm', min: 50, max: 70, actionLink: '3', special: 'General', method: 'Profilometer', s1: 55, s2: 62, s3: 58, s4: 65, s5: 60, okay: false },
      { parameter: 'COATING THICKNESS', spec: '15 µm', min: 12, max: 18, actionLink: '9', special: 'Critical', method: 'DFT Gauge', s1: 14, s2: 13, s3: 15, s4: 16, s5: 15, okay: true },
      { parameter: 'SCRATCH DEPTH', spec: '< 0.05 mm', min: 0, max: 0.05, actionLink: '14', special: 'General', method: 'Visual/Laser', s1: 0.01, s2: 0.02, s3: 0.04, s4: 0.01, s5: 0.02, okay: false },
      { parameter: 'WAVINESS (Wt)', spec: '0.8 µm', min: 0.5, max: 1.0, actionLink: '6', special: 'General', method: 'Scanner', s1: 0.6, s2: 0.9, s3: 0.7, s4: 0.8, s5: 0.7, okay: true },
      { parameter: 'MATERIAL THICKNESS', spec: '2.5±0.1', min: 2.4, max: 2.6, actionLink: '21', special: 'Critical', method: 'Caliper', s1: 2.5, s2: 2.5, s3: 2.6, s4: 2.4, s5: 2.5, okay: true },
      { parameter: 'HARDNESS (HRC)', spec: '45±2', min: 43, max: 47, actionLink: '23', special: 'General', method: 'Rockwell', s1: 44, s2: 45, s3: 46, s4: 42, s5: 45, okay: false },
      { parameter: 'ROUGHNESS (Rz)', spec: 'Rz 6.3', min: 4.0, max: 7.0, actionLink: '26', special: 'General', method: 'Profilometer', s1: 5.5, s2: 6.0, s3: 6.5, s4: 5.8, s5: 6.2, okay: true },
      { parameter: 'MAX ROUGHNESS (Rmax)', spec: '10.0µm', min: 5.0, max: 10.0, actionLink: '27', special: 'General', method: 'Laser Scan', s1: 8.5, s2: 9.0, s3: 11.2, s4: 8.8, s5: 7.9, okay: false },
      { parameter: 'PLATING THICKNESS', spec: '10±2µm', min: 8, max: 12, actionLink: '29', special: 'Critical', method: 'XRF', s1: 9, s2: 10.5, s3: 11, s4: 9.5, s5: 10, okay: true },
      { parameter: 'ANODIZING DEPTH', spec: '25±5µm', min: 20, max: 30, actionLink: '210', special: 'General', method: 'Eddy Current', s1: 22, s2: 24, s3: 28, s4: 31, s5: 26, okay: false },
      { parameter: 'SURFACE POROSITY', spec: '< 1%', min: 0, max: 1.5, actionLink: '211', special: 'Critical', method: 'Microscope', s1: 0.5, s2: 0.2, s3: 0.8, s4: 1.1, s5: 0.4, okay: true }
    ],
    'Performance (12)': [
      { parameter: 'MAX RPM', spec: '3000', min: 2900, max: 3100, actionLink: '5', special: 'Critical', method: 'Tachometer', s1: 2950, s2: 3050, s3: 3000, s4: 2980, s5: 3020, okay: false },
      { parameter: 'FLOW RATE', spec: '50 L/min', min: 48, max: 52, actionLink: '2', special: 'General', method: 'Flow Meter', s1: 49, s2: 51, s3: 50, s4: 48.5, s5: 49.5, okay: true },
      { parameter: 'PRESSURE DROP', spec: '< 0.5 bar', min: 0, max: 0.5, actionLink: '15', special: 'Critical', method: 'Pressure Gauge', s1: 0.2, s2: 0.3, s3: 0.4, s4: 0.25, s5: 0.35, okay: true },
      { parameter: 'CYCLE TIME', spec: '45 sec', min: 40, max: 50, actionLink: '31', special: 'General', method: 'Stopwatch', s1: 44, s2: 46, s3: 45, s4: 47, s5: 45, okay: true },
      { parameter: 'MACHINE UPTIME', spec: '95%', min: 90, max: 100, actionLink: '32', special: 'Critical', method: 'System Log', s1: 94, s2: 96, s3: 92, s4: 98, s5: 95, okay: true },
      { parameter: 'SCRAP RATE', spec: '< 2%', min: 0, max: 2.5, actionLink: '33', special: 'General', method: 'Weight', s1: 1.5, s2: 1.2, s3: 2.1, s4: 1.8, s5: 1.9, okay: true },
      { parameter: 'THROUGHPUT', spec: '100 parts/hr', min: 90, max: 110, actionLink: '34', special: 'Critical', method: 'Counter', s1: 95, s2: 105, s3: 102, s4: 98, s5: 88, okay: false },
      { parameter: 'POWER CONSUMPTION', spec: '< 5 kW', min: 3.0, max: 5.5, actionLink: '35', special: 'General', method: 'Wattmeter', s1: 4.2, s2: 4.5, s3: 4.8, s4: 4.1, s5: 4.4, okay: true },
      { parameter: 'NOISE LEVEL', spec: '< 85 dB', min: 70, max: 85, actionLink: '36', special: 'General', method: 'Decibel Meter', s1: 75, s2: 78, s3: 82, s4: 80, s5: 86, okay: false },
      { parameter: 'VIBRATION LIMIT', spec: '< 2.0 mm/s', min: 0, max: 2.5, actionLink: '37', special: 'Critical', method: 'Accelerometer', s1: 1.2, s2: 1.5, s3: 1.8, s4: 1.4, s5: 1.1, okay: true },
      { parameter: 'OPERATING TEMP', spec: '60±5 °C', min: 55, max: 65, actionLink: '38', special: 'General', method: 'Thermocouple', s1: 58, s2: 61, s3: 63, s4: 59, s5: 62, okay: true },
      { parameter: 'MTTR', spec: '< 2 hrs', min: 0.5, max: 2.5, actionLink: '312', special: 'General', method: 'Log Analysis', s1: 1.2, s2: 1.5, s3: 2.0, s4: 1.8, s5: 1.1, okay: true }
    ],
    'Metallurgical (12)': [
      { parameter: 'GRAIN SIZE', spec: 'ASTM 6-8', min: 6, max: 8, actionLink: '18', special: 'Critical', method: 'Microscope', s1: 7, s2: 6.5, s3: 7.5, s4: 6.8, s5: 7.2, okay: true },
      { parameter: 'INCLUSION RATING', spec: '< Level 2', min: 0, max: 2, actionLink: '6', special: 'General', method: 'Microscope', s1: 1, s2: 1.5, s3: 0.5, s4: 1.2, s5: 1.0, okay: false },
      { parameter: 'DECARBURIZATION', spec: '< 0.1 mm', min: 0, max: 0.1, actionLink: '4', special: 'Critical', method: 'Optical', s1: 0.05, s2: 0.08, s3: 0.04, s4: 0.06, s5: 0.07, okay: true },
      { parameter: 'MICROSTRUCTURE', spec: 'Martensite', min: 0, max: 0, actionLink: '4', special: 'Critical', method: 'Etching', s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, okay: false },
      { parameter: 'CORE HARDNESS', spec: '30 HRC', min: 28, max: 32, actionLink: '9', special: 'General', method: 'Rockwell', s1: 29, s2: 31, s3: 30, s4: 28.5, s5: 30.5, okay: true },
      { parameter: 'CALIBRATION DRIFT', spec: '0.01%', min: 0.005, max: 0.015, actionLink: '41', special: 'Critical', method: 'Master Gauge', s1: 0.01, s2: 0.012, s3: 0.009, s4: 0.011, s5: 0.01, okay: true },
      { parameter: 'SENSOR VOLTAGE', spec: '5.0V', min: 4.8, max: 5.2, actionLink: '42', special: 'General', method: 'Multimeter', s1: 4.9, s2: 5.1, s3: 5.0, s4: 4.8, s5: 5.2, okay: true },
      { parameter: 'PROBE ALIGNMENT', spec: '0.0±0.1 deg', min: -0.1, max: 0.1, actionLink: '43', special: 'General', method: 'Laser', s1: 0.05, s2: -0.02, s3: 0.01, s4: 0.08, s5: -0.05, okay: true },
      { parameter: 'READING DELAY', spec: '< 50ms', min: 10, max: 60, actionLink: '44', special: 'General', method: 'Oscilloscope', s1: 45, s2: 55, s3: 40, s4: 48, s5: 50, okay: false },
      { parameter: 'THERMAL STABILITY', spec: '±1°C', min: -1.5, max: 1.5, actionLink: '45', special: 'Critical', method: 'Chamber', s1: 0.5, s2: -0.8, s3: 1.2, s4: -0.5, s5: 0.0, okay: true },
      { parameter: 'MICROHARDNESS', spec: '300±20 HV', min: 280, max: 320, actionLink: '48', special: 'Critical', method: 'Vickers', s1: 290, s2: 310, s3: 305, s4: 295, s5: 315, okay: true },
      { parameter: 'CASE DEPTH', spec: '1.5±0.2 mm', min: 1.3, max: 1.7, actionLink: '49', special: 'Critical', method: 'Cross Section', s1: 1.4, s2: 1.6, s3: 1.5, s4: 1.35, s5: 1.45, okay: true }
    ],
    'Mechanical (12)': [
      { parameter: 'YIELD STRENGTH', spec: '400 MPa', min: 380, max: 420, actionLink: '2', special: 'Critical', method: 'UTM', s1: 390, s2: 410, s3: 405, s4: 395, s5: 400, okay: false },
      { parameter: 'ELONGATION', spec: '> 15%', min: 15, max: 25, actionLink: '1', special: 'General', method: 'UTM', s1: 16, s2: 18, s3: 17, s4: 19, s5: 20, okay: true },
      { parameter: 'IMPACT ENERGY', spec: '27 J', min: 25, max: 35, actionLink: '11', special: 'Critical', method: 'Charpy', s1: 28, s2: 30, s3: 26, s4: 29, s5: 32, okay: false },
      { parameter: 'SHEAR STRENGTH', spec: '250 MPa', min: 240, max: 260, actionLink: '7', special: 'General', method: 'UTM', s1: 245, s2: 255, s3: 250, s4: 248, s5: 252, okay: true },
      { parameter: 'MODULUS OF ELASTICITY', spec: '200 GPa', min: 190, max: 210, actionLink: '54', special: 'General', method: 'Resonance Test', s1: 198, s2: 205, s3: 195, s4: 202, s5: 200, okay: true },
      { parameter: 'ULTIMATE TENSILE STRENGTH', spec: '600 MPa', min: 580, max: 620, actionLink: '55', special: 'Critical', method: 'Tensile Tester', s1: 590, s2: 610, s3: 605, s4: 595, s5: 615, okay: true },
      { parameter: 'COMPRESSIVE STRENGTH', spec: '800 MPa', min: 750, max: 850, actionLink: '57', special: 'Critical', method: 'Compression Test', s1: 780, s2: 820, s3: 810, s4: 790, s5: 860, okay: false },
      { parameter: 'FATIGUE CYCLES', spec: '> 1,000,000', min: 900000, max: 1200000, actionLink: '58', special: 'Critical', method: 'Fatigue Tester', s1: 1050000, s2: 1100000, s3: 980000, s4: 1150000, s5: 1020000, okay: true },
      { parameter: 'FRACTURE TOUGHNESS', spec: '50 MPa√m', min: 45, max: 55, actionLink: '59', special: 'Critical', method: 'CT Specimen', s1: 48, s2: 52, s3: 50, s4: 49, s5: 51, okay: true },
      { parameter: 'POISSON RATIO', spec: '0.3', min: 0.28, max: 0.32, actionLink: '510', special: 'General', method: 'Strain Gauge', s1: 0.29, s2: 0.31, s3: 0.30, s4: 0.29, s5: 0.31, okay: true },
      { parameter: 'BEND TEST ANGLE', spec: '180°', min: 175, max: 180, actionLink: '511', special: 'General', method: 'Bend Fixture', s1: 178, s2: 180, s3: 179, s4: 177, s5: 180, okay: true },
      { parameter: 'TORSIONAL YIELD', spec: '200 MPa', min: 190, max: 210, actionLink: '512', special: 'General', method: 'Torsion Tester', s1: 195, s2: 205, s3: 200, s4: 198, s5: 185, okay: false }
    ]
  };

  ngOnInit(): void {
    // Load the initial data for the default selected tab
    this.tableData = this.categoryData[this.selectedCategory] || [];
    this.updatePage();
  }

  // Set active category tab AND update table data
  selectCategory(cat: string) {
    this.selectedCategory = cat;
    // Load the new parameters array based on the clicked tab
    this.tableData = this.categoryData[cat] || [];
    // Reset pagination back to page 1
    this.pageIndex = 0; 
    this.updatePage();
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
    dialogRef.afterClosed().subscribe(data => {});
  }

  opendocpop() {
    this.dialog.open(ViewDocPhotosComponent, {
      width: '600px',
      height: '450px',
    });
  }

  editParameter(item: any) {
    let dialogRef = this.dialog.open(PartsAddParameterComponent, {
      height: 'auto',
      width: '850px',
      data: item // Tells the popup it's in Edit mode
    });
    dialogRef.afterClosed().subscribe(data => {
      // Handle any updates after popup closes if necessary
    });
  }

  opennotes() {
    this.dialog.open(AuditrefRemarksPopComponent, {
      width: '500px',
      height: 'auto'
    });
  }

  deleteParameter(item: any): void {
    const confirmDelete = window.confirm('Are you sure you want to delete?');
    
    if (confirmDelete) {
      // Find the index of the item in the currently active tableData array
      const index = this.tableData.indexOf(item);
      
      if (index > -1) {
        // Remove the item from the array
        this.tableData.splice(index, 1);
        
        // Refresh the paginated view to reflect the deletion
        this.updatePage();
      }
    }
  }
}