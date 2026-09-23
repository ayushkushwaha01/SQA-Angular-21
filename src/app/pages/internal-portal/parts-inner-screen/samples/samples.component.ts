import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
 import { AlertService } from 'src/app/shared/alert.service';
import { PartAuditService } from '../../parts-audits/part-audit.service';

@Component({
  standalone: false,
  selector: 'app-samples',
  templateUrl: './samples.component.html',
  styleUrls: ['./samples.component.scss']
})
export class SamplesComponent implements OnInit {

  selectedSample: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' = 'S1';

  // Route values
  partId!: number;
  partAuditId!: number;

  // Table data
  tableData: any[] = [];

  // Loading state
  isLoading: boolean = false;

  // Saving state
  isSaving: boolean = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private partauditservice: PartAuditService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      // Get selected sample
      const sample = params['sample'];

      if (
        sample === 'S1' ||
        sample === 'S2' ||
        sample === 'S3' ||
        sample === 'S4' ||
        sample === 'S5'
      ) {
        this.selectedSample = sample;
      } else {
        this.selectedSample = 'S1';
      }

      // Get PartId
      this.partId = Number(params['partId'] || 0);

      // Get PartAuditId
      this.partAuditId = Number(params['partAuditId'] || 0);

      console.log('Selected Sample:', this.selectedSample);
      console.log('PartId:', this.partId);
      console.log('PartAuditId:', this.partAuditId);

      // Load parameters
      this.getParameters();
    });
  }

  getParameters(): void {

    if (!this.partAuditId || !this.partId) {
      console.warn('PartAuditId or PartId is missing.');
      this.tableData = [];
      return;
    }

    this.isLoading = true;

    const filter: any = {
      PartAuditId: this.partAuditId
    };

    this.partauditservice.getCategoryAuditsParameters(filter)
      .subscribe({

        next: (res: any) => {

          this.isLoading = false;

          if (!res || !res.success) {
            this.tableData = [];
            return;
          }

          const category = (res.data || []).find(
            (x: any) => Number(x.partId) === Number(this.partId)
          );

          if (!category) {
            this.tableData = [];
            return;
          }

          this.tableData = (category.parameters || []).map(
            (item: any) => {

              return {

                // IDs - IMPORTANT
                auditParameterId: item.auditParameterId,
                partAuditId: item.partAuditId,
                parameterId: item.parameterId,

                // IMPORTANT: preserve these values
                partMasterId:
                  item.partMasterId ??
                  category.partMasterId ??
                  0,

                partFamilyId:
                  item.partFamilyId ??
                  category.partFamilyId ??
                  0,

                partId:
                  item.partId ??
                  category.partId ??
                  this.partId,

                // Parameter details
                parameter: item.parmeterName,
                parmeterName: item.parmeterName,

                spec: item.spec,
                min: item.min,
                max: item.max,
                method: item.method,

                // Unit
                unitId: item.unitId,
                unit: item.unitName,

                // Samples
                s1: item.s1 ?? '',
                s2: item.s2 ?? '',
                s3: item.s3 ?? '',
                s4: item.s4 ?? '',
                s5: item.s5 ?? '',

                // Selected sample
                actual: this.getSelectedSampleValue(item),

                remarks: item.remarks ?? '',
                okay: item.okay ?? false
              };
            }
          );

          console.log('Samples Table Data:', this.tableData);
        },

        error: (err) => {

          this.isLoading = false;

          console.error(
            'Error loading parameters:',
            err
          );

          this.tableData = [];
        }
      });
  }
  /**
   * Get S1/S2/S3/S4/S5 value based on selectedSample.
   */
  private getSelectedSampleValue(item: any): string {

    switch (this.selectedSample) {

      case 'S1':
        return item.s1 ?? '';

      case 'S2':
        return item.s2 ?? '';

      case 'S3':
        return item.s3 ?? '';

      case 'S4':
        return item.s4 ?? '';

      case 'S5':
        return item.s5 ?? '';

      default:
        return '';
    }
  }

  /**
   * Update the selected S1/S2/S3/S4/S5 value
   * from the Actual input.
   */
  private updateSelectedSampleValue(item: any): void {

    switch (this.selectedSample) {

      case 'S1':
        item.s1 = item.actual ?? '';
        break;

      case 'S2':
        item.s2 = item.actual ?? '';
        break;

      case 'S3':
        item.s3 = item.actual ?? '';
        break;

      case 'S4':
        item.s4 = item.actual ?? '';
        break;

      case 'S5':
        item.s5 = item.actual ?? '';
        break;
    }
  }

  UpsertParameter(): void {

    if (!this.tableData || this.tableData.length === 0) {

      this.alertService.createAlert(
        'No parameters available to save.',
        0
      );

      return;
    }

    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    let completedCount = 0;
    let failedCount = 0;

    const totalCount = this.tableData.length;

    this.tableData.forEach((item: any) => {

      // Update ONLY selected sample
      switch (this.selectedSample) {

        case 'S1':
          item.s1 = item.actual ?? '';
          break;

        case 'S2':
          item.s2 = item.actual ?? '';
          break;

        case 'S3':
          item.s3 = item.actual ?? '';
          break;

        case 'S4':
          item.s4 = item.actual ?? '';
          break;

        case 'S5':
          item.s5 = item.actual ?? '';
          break;
      }

      // EXACT payload structure like your existing form
      const payload = {

        AuditParameterId: item.auditParameterId,

        PartAuditId: item.partAuditId,

        ParameterId: item.parameterId,

        PartMasterId: item.partMasterId,

        PartFamilyId: item.partFamilyId,

        PartId: item.partId,

        ParmeterName: item.parmeterName || item.parameter,

        Spec: item.spec != null
          ? item.spec.toString()
          : '',

        Min: item.min != null
          ? item.min.toString()
          : '',

        Max: item.max != null
          ? item.max.toString()
          : '',

        Method: item.method || '',

        UnitId: item.unitId,

        S1: item.s1 != null ? item.s1.toString() : '',
        S2: item.s2 != null ? item.s2.toString() : '',
        S3: item.s3 != null ? item.s3.toString() : '',
        S4: item.s4 != null ? item.s4.toString() : '',
        S5: item.s5 != null ? item.s5.toString() : '',

        Remarks: item.remarks || '',

        Okay: item.okay ?? false
      };

      console.log('SAVE PAYLOAD:', payload);

      this.partauditservice
        .upsertPartAuditParameter(payload)
        .subscribe({

          next: (res: any) => {

            completedCount++;

            if (!res?.success) {
              failedCount++;
              console.error(
                'Save failed:',
                payload,
                res
              );
            }

            if (completedCount === totalCount) {

              this.isSaving = false;

              if (failedCount === 0) {

                this.alertService.createAlert(
                  `${this.selectedSample} values updated successfully.`,
                  1
                );

                // Reload to get fresh DB values
                this.getParameters();

              } else {

                this.alertService.createAlert(
                  `${totalCount - failedCount} saved, ${failedCount} failed.`,
                  0
                );
              }
            }
          },

          error: (err) => {

            completedCount++;
            failedCount++;

            console.error(
              `Error saving AuditParameterId ${item.auditParameterId}:`,
              err
            );

            if (completedCount === totalCount) {

              this.isSaving = false;

              this.alertService.createAlert(
                `${totalCount - failedCount} saved, ${failedCount} failed.`,
                0
              );
            }
          }

        });

    });
  }

  /**
   * Optional method:
   * Save only one parameter row.
   *
   * You can use this later if you add a Save icon
   * for every individual row.
   */
  saveParameter(item: any): void {

    if (!item) {
      return;
    }

    // Update selected S1-S5 value
    this.updateSelectedSampleValue(item);

    const payload = {

      AuditParameterId: item.auditParameterId,
      PartAuditId: item.partAuditId,
      ParameterId: item.parameterId,

      ParameterName: item.parameter,
      Spec: item.spec,

      Min: item.min != null
        ? item.min.toString()
        : '',

      Max: item.max != null
        ? item.max.toString()
        : '',

      S1: item.s1 != null
        ? item.s1.toString()
        : '',

      S2: item.s2 != null
        ? item.s2.toString()
        : '',

      S3: item.s3 != null
        ? item.s3.toString()
        : '',

      S4: item.s4 != null
        ? item.s4.toString()
        : '',

      S5: item.s5 != null
        ? item.s5.toString()
        : '',

      Remarks: item.remarks ?? '',
      Okay: item.okay ?? false
    };

    console.log(
      'Single Parameter Payload:',
      payload
    );

    this.partauditservice
      .upsertPartAuditParameter(payload)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(
              res.message || 'Parameter updated successfully.',
              1
            );

          } else {

            this.alertService.createAlert(
              res.message || 'Failed to update parameter.',
              0
            );
          }
        },

        error: (err) => {

          console.error(err);

          this.alertService.createAlert(
            'Something went wrong while updating parameter.',
            0
          );
        }
      });
  }

  /**
   * Go back to previous page.
   */
  goback(): void {
    this.location.back();
  }
}