import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
 
import { Location } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-process-audit-details',
  templateUrl: './process-audit-details.component.html',
  styleUrls: ['./process-audit-details.component.scss']
})
export class ProcessAuditDetailsComponent implements OnInit {

  
  auditForm!: FormGroup;
    
    // Options for the dropdowns
    pdcaOptions = ['Plan', 'Do', 'Check', 'Act'];
    severityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    occurrenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    detectionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
    // Placeholder images for the gallery to match your screenshot
    images: string[] = [
      "assets/img8.jpg",
      "assets/img-001.jpg",
          "assets/img-002.jpg",
      "assets/img-003.jpg",
      "assets/img5.jpg",
    ];
  
    constructor(private fb: FormBuilder,private location:Location) { }
  
      goBack(): void {
      this.location.back();
    }
  
    ngOnInit(): void {
      this.initForm();
      this.setupScoreCalculation();
    }
  
    initForm(): void {
      this.auditForm = this.fb.group({
        subject: [''],
        pdfFile: [null],
        dueDate: [''],
        completedDate: [''],
        pdcaStatus: [''],
        severity: [8],
        occurrence: [4],
        detection: [2],
        sodScore: [{ value: '842', disabled: true }], // Disabled as it is calculated
        riskRating: [{ value: 'High', disabled: true }],
        isResolved: [false],
        observations: [''],
        correctiveActions: [''],
        supplierRemarks: ['']
      });
    }
  
    setupScoreCalculation(): void {
      // Listen to changes on S, O, and D to recalculate the SOD Score automatically
      this.auditForm.valueChanges.subscribe(values => {
        if (values.severity && values.occurrence && values.detection) {
          // Based on the screenshot (S=8, O=4, D=2 -> 842), concatenating the string
          const sodStr = `${values.severity}${values.occurrence}${values.detection}`;
          this.auditForm.get('sodScore')?.setValue(sodStr, { emitEvent: false });
          
          // Example basic logic for Risk Rating 
          const risk = parseInt(sodStr, 10) > 500 ? 'High' : 'Low';
          this.auditForm.get('riskRating')?.setValue(risk, { emitEvent: false });
        }
      });
    }
  
    onFileSelected(event: any): void {
      // Handle image upload logic here
      const file = event.target.files[0];
      if (file) {
        console.log('File selected:', file.name);
        // Logic to preview image would go here
      }
    }
  
    onSubmit(): void {
      console.log('Form Submitted', this.auditForm.getRawValue());
    }
}
