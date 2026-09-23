import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-activeaudits-reference',
  templateUrl: './activeaudits-reference.component.html',
  styleUrls: ['./activeaudits-reference.component.scss']
})
export class ActiveauditsReferenceComponent implements OnInit {

  // Top Categories
  categories = ['CAT A (4)', 'CAT B (2)', 'CAT C (5)', 'CAT D (4)', 'CAT E (4)'];
  selectedCategory = 'CAT D (4)';

  // Process Steps Configuration
  processSteps = [
    { id: 1, tooltip: 'Casting (4)', status: 'green' },
    { id: 2, tooltip: 'Forging (1)', status: 'green' },
    { id: 3, tooltip: 'Machining (3)', status: 'green' },
    { id: 4, tooltip: 'Non-Metallic (5)', status: 'red' },
    { id: 5, tooltip: 'Sheet Metal (4)', status: 'green' },
    { id: 6, tooltip: 'Proprietary (1)', status: 'green' },
    { id: 7, tooltip: 'Steel Mills (3)', status: 'green' },
    { id: 8, tooltip: 'Casting (4)', status: 'green' },
    { id: 9, tooltip: 'Forging (1)', status: 'green' },
    { id: 10, tooltip: 'Machining (3)', status: 'yellow' },
    { id: 11, tooltip: 'Non-Metallic (5)', status: 'yellow' },
    { id: 12, tooltip: 'Sheet Metal (4)', status: 'green' }
  ];
  selectedStep = 10;

  // Form Controls Models
  rating = 'NA';
  
  // Dropdown Options
  severities = [
    { value: '8', label: '8 - Primary Performance Failure' },
    { value: '9', label: '9 - Safety/Regulatory' }
  ];
  occurrences = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  detections = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  pdcaStatuses = ['Plan', 'Do', 'Check', 'Act'];
  actionTypes = ['Containment', 'Corrective', 'Preventive'];

  // Selected Values
  selectedSeverity = '8';
  selectedOccurrence = '4';
  selectedDetection = '2';
  pdcaStatus = '';
  actionType = '';
  isResolved = false;

  // Image Gallery Mock Data
  galleryImages = [
    'assets/img8.jpg',
    'assets/img12.jpeg',
    'assets/img13.jpg',
    'assets/img11.jpg',
    'assets/img5.jpg'
  ];

  constructor() { }

  ngOnInit(): void {
  }

  // Set active category tab
  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  // Set active process step
  selectStep(id: number) {
    this.selectedStep = id;
  }

  // Set rating
  setRating(val: string) {
    this.rating = val;
  }

  // Auto-calculated SOD Score
  get sodScore(): string {
    if (!this.selectedSeverity || !this.selectedOccurrence || !this.selectedDetection) return '';
    return `${this.selectedSeverity}${this.selectedOccurrence}${this.selectedDetection}`;
  }

  // Auto-calculated Risk Rating based on SOD Score
  get riskRating(): string {
    const score = parseInt(this.sodScore, 10);
    if (isNaN(score)) return '';
    if (score >= 800) return 'High';
    if (score >= 400) return 'Medium';
    return 'Low';
  }
}