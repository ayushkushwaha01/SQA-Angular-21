import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InspectionService } from '../../inspection/inspection.service';
import { AlertService } from 'src/app/shared/alert.service'; // Adjust path if needed

@Component({
  standalone: false,
  selector: 'app-add-samples',
  templateUrl: './add-samples.component.html',
  styleUrls: ['./add-samples.component.scss']
})
export class AddSamplesComponent implements OnInit {

  tableData: any[] = [];
  sampleColumn: string = 's1';
  reference: string = '';
  inspectionId: number = 0;
  category: string = 'All';

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private inspectionService: InspectionService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    // 1. Grab data passed from the parent route's queryParams
    this.route.queryParams.subscribe(params => {
      this.inspectionId = Number(params['inspectionId']);
      this.sampleColumn = params['sampleColumn'] || 's1';
      this.reference = params['reference'] || '';
      this.category = params['category'] || 'All';

      if (this.inspectionId) {
        this.loadParameters();
      }
    });
  }

  loadParameters() {
    this.inspectionService.getInspectionParameters(this.inspectionId).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          const flattenedParams: any[] = [];

          res.data.forEach((categoryGroup: any) => {
            const catName = categoryGroup.categoryName || categoryGroup.CategoryName || '';
            const matchCategory = !this.category || this.category === 'All' || 
              catName.toString().trim().toLowerCase() === this.category.toString().trim().toLowerCase();

            if (matchCategory && categoryGroup.parameters && categoryGroup.parameters.length > 0) {
              categoryGroup.parameters.forEach((item: any) => {
                flattenedParams.push(item);
              });
            }
          });

          // 3. Map to table format, extracting the correct actual sample value dynamically
          this.tableData = flattenedParams.map((p: any) => ({
            inspectionRefId: p.id || p.Id || p.inspectionRefId || p.InspectionRefId,
            parameter: p.parameter || p.Parameter || p.parameterName || p.ParameterName || 'N/A',
            spec: p.spec || p.Spec || '-',
            unit: p.unit || p.Unit || '-',
            min: p.min || p.Min || '-',
            max: p.max || p.Max || '-',
            // Access the property (e.g., p['s1'] or p['S1'])
            actual: p[this.sampleColumn] ?? p[this.sampleColumn.toUpperCase()] ?? '' 
          }));
        }
      },
      error: (err) => {
        console.error('Failed to load parameters', err);
      }
    });
  }

  save() {
    // 4. Create the payload for the bulk update API
    const payload = this.tableData.map(item => ({
      inspectionRefId: item.inspectionRefId,
      sampleNumber: this.sampleColumn, 
      value: item.actual?.toString() || null
    }));

    this.inspectionService.updateSampleValues(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.alertService.createAlert(`Sample ${this.sampleColumn.toUpperCase()} values updated successfully!`);
          this.goback(); // Navigate back automatically on success
        } else {
          this.alertService.createAlert("Failed to update samples: " + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        this.alertService.createAlert("An error occurred while saving samples.");
      }
    });
  }

  goback() {
    this.location.back();
  }
}