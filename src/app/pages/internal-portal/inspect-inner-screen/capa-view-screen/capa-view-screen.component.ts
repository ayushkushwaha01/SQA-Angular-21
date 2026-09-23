import { PartAuditService } from './../../parts-audits/part-audit.service';
import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InspectionService } from '../../inspection/inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-capa-view-screen',
  templateUrl: './capa-view-screen.component.html',
  styleUrls: ['./capa-view-screen.component.scss']
})
export class CapaViewScreenComponent implements OnInit {

  auditForm!: FormGroup;
  inspectionRefId: number = 0;
  pdcaOptions = ['Plan', 'Do', 'Check', 'Act'];
  severityOptions: any[] = [];
  occurrenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  detectionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  isReadOnly: boolean = false;
  isSupplier: boolean = false;
  isUpdate: boolean = false;
  isSaved: boolean = false;
  parameterName: string = '';

  isSlideshowOpen = false;
  currentSlideIndex = 0;

  // Arrays for PDFs
  selectedFiles: File[] = [];
  uploadedDocs: any[] = [];

  // Arrays for Images
  apiImages: string[] = [];
  localImageFiles: File[] = [];
  localImagePreviews: string[] = [];

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;

  readonly SCREEN_ID: number = 42;


  // Combined for Slideshow
  get slideshowImages(): string[] {
    return [...this.apiImages, ...this.localImagePreviews];
  }


  constructor(
    private fb: FormBuilder,
    private location: Location,
    private route: ActivatedRoute,
    private inspectionService: InspectionService,
    private alertService: AlertService,
    private setupService: SetupService,
    private PartAuditService: PartAuditService
  ) { }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

    this.isSupplier = localStorage.getItem('UserType') === 'Supplier';
    this.initForm();
    this.loadSeverities();
    this.setupScoreCalculation();
    this.getDemeritMaster();
    this.getOccurrences();
    this.getDetections();

    this.route.queryParams.subscribe(params => {
      this.isReadOnly = params['isReadOnly'] === 'true' || params['readOnly'] === 'true';
      if (this.isSupplier) {
        this.isReadOnly = true;
      }
      this.parameterName = params['parameterName'] || '';
      if (params['inspectionRefId']) {
        this.inspectionRefId = Number(params['inspectionRefId']);
        this.loadCapaDetails();
      } else {
        if (this.isReadOnly || this.isSupplier) {
          this.auditForm.disable();
          if (this.isSupplier) {
            this.auditForm.get('supplierRemarks')?.enable();
            this.auditForm.get('correctiveActions')?.enable();
          }
        }
      }
    });
  }

  goBack(): void {
    this.location.back();
  }



  demeritOptions: any[] = [];
  getDemeritMaster() {

    this.PartAuditService.getDemeritDD()
      .subscribe((res: any) => {

        if (res.success) {

          this.demeritOptions = res.data.map((item: any) => {

            let bgColor = '';
            let color = '';

            switch (item.subject) {

              case 'Minor':
                bgColor = '#dcfce7';
                color = '#166534';
                break;

              case 'Small':
                bgColor = '#fef9c3';
                color = '#854d0e';
                break;

              case 'Moderate':
                bgColor = '#ffedd5';
                color = '#9a3412';
                break;

              case 'Major':
                bgColor = '#fee2e2';
                color = '#991b1b';
                break;

              case 'Critical':
                bgColor = '#fecaca';
                color = '#7f1d1d';
                break;
            }

            return {
              ...item,
              bgColor: bgColor,
              color: color
            };

          });

        }

      });

  }
  selectDemerit(item: any) {

    this.auditForm.patchValue({
      demeritId: item.demeritId
    });

  }

  Occurrences: any[] = [];
  getOccurrences() {
    this.PartAuditService.getOccurrenceDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.Occurrences = res.data;
          this.calculateSodScore();

        }
      });
  }
  detections: any[] = [];
  getDetections() {
    this.PartAuditService.getDetectionDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.detections = res.data;
          this.calculateSodScore();

        }
      });
  }




  initForm(): void {

    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const localToday = `${year}-${month}-${day}`;

    this.auditForm = this.fb.group({
      capaId: [0],
      inspectionRefId: [0],
      subject: ['', Validators.required],
      logDate: [localToday, Validators.required],
      dueDate: [''],
      completedDate: [''],
      pdcaStatus: [''],
      severityId: [null],
      occurrence: [null],
      detection: [null],
      sodScore: [{ value: '', disabled: true }],
      demerit: [null], // Changed from riskRating
      class: [''],
      actionType: [''],
      capaSubject: [''],
      observations: [''],
      correctiveActions: [''],
      supplierRemarks: [''],
      demeritId: [null],

      occurrenceId: [null],
      detectionId: [null]
    });
  }

  loadSeverities(): void {
    this.setupService.getSeverities().subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.severityOptions = res.data.filter((s: any) => s.isActive && !s.isDeleted);
          this.calculateSodScore();
        }
      },
      error: (err) => console.error('Error fetching severities', err)
    });
  }

  loadCapaDetails(): void {
    this.inspectionService.getCapaByInspectionRefId(this.inspectionRefId).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) {
          const data = res[0];
          this.isUpdate = true;

          // Parse legacy risk rating into numeric demerit
          let mappedDemerit = null;
          let legacyRisk = data.demerit || data.riskRating;

          if (legacyRisk) {
            if (typeof legacyRisk === 'string' && legacyRisk.includes('-')) {
              // e.g., "Excellent - 5" -> 5
              mappedDemerit = parseInt(legacyRisk.split('-')[1].trim(), 10);
            } else if (typeof legacyRisk === 'number') {
              mappedDemerit = legacyRisk;
            } else if (!isNaN(Number(legacyRisk))) {
              mappedDemerit = Number(legacyRisk);
            }
          }

          this.auditForm.patchValue({
            capaId: data.id,
            inspectionRefId: this.inspectionRefId,
            subject: data.subject,
            logDate: data.logDate ? data.logDate.split('T')[0] : '',
            dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
            completedDate: data.completedDate ? data.completedDate.split('T')[0] : '',
            pdcaStatus: data.status,
            severityId: data.severityId,
            occurrence: data.occurrence,
            detection: data.detection,
            sodScore: data.sodScore,
            demerit: mappedDemerit,
            class: data.class || '',
            actionType: data.actionType,
            capaSubject: data.capaSubject,
            observations: data.observations,
            correctiveActions: data.correctiveActions,
            supplierRemarks: data.supplierRemarks,
            demeritId: data.demeritId,

            occurrenceId: data.occurrenceId,
            detectionId: data.detectionId,

          });

          // Parse existing images (API)
          this.apiImages = [];
          if (data.imageDocs) {
            data.imageDocs.split(',').forEach((url: string) => {
              url = url.trim();
              if (url) this.apiImages.push(url);
            });
          }

          // Parse existing PDFs (API)
          this.uploadedDocs = [];
          if (data.pdfDocs) {
            data.pdfDocs.split(',').forEach((url: string) => {
              url = url.trim();
              if (url) {
                this.uploadedDocs.push({
                  url: url,
                  title: url.split('/').pop()?.split('?')[0] || 'Document'
                });
              }
            });
          }

          // Reset local selections on load
          this.selectedFiles = [];
          this.localImageFiles = [];
          this.localImagePreviews = [];
        }

        if (this.isReadOnly || this.isSupplier) {
          this.auditForm.disable();
          if (this.isSupplier) {
            this.auditForm.get('supplierRemarks')?.enable();
            this.auditForm.get('correctiveActions')?.enable();
          }
        }
      },
      error: (err) => {
        console.error('Error fetching CAPA data', err);
        if (this.isReadOnly || this.isSupplier) {
          this.auditForm.disable();
          if (this.isSupplier) {
            this.auditForm.get('supplierRemarks')?.enable();
            this.auditForm.get('correctiveActions')?.enable();
          }
        }
      }
    });
  }

  setupScoreCalculation(): void {
    this.auditForm.valueChanges.subscribe(() => {
      this.isSaved = false;
      this.calculateSodScore();
    });
  }

  private calculateSodScore(): void {
    const values = this.auditForm.getRawValue();
    const selectedSeverity = this.severityOptions.find(s => s.severityId === values.severityId);
    const selectedOccurrence = this.Occurrences.find(o => o.occurrenceId === values.occurrenceId);
    const selectedDetection = this.detections.find(d => d.detectionId === values.detectionId);

    if (selectedSeverity && selectedOccurrence && selectedDetection) {
      const sod = `${selectedSeverity.rating}${selectedOccurrence.rating}${selectedDetection.rating}`;
      this.auditForm.get('sodScore')?.setValue(Number(sod), { emitEvent: false });
    } else {
      this.auditForm.get('sodScore')?.setValue('', { emitEvent: false });
    }
  }

  // Custom setter for Demerit selection 
  setDemerit(val: number): void {
    if (this.isReadOnly && !this.isSupplier) {
      return;
    }
    this.auditForm.get('demerit')?.setValue(val);
    this.auditForm.markAsDirty();
  }

  // onSubmit(): void {
  //   if (this.isReadOnly && !this.isSupplier) {
  //     return;
  //   }
  //   if (this.auditForm.invalid) {
  //     this.alertService.createAlert("Please fill all required fields.");
  //     return;
  //   }

  //   const formDataValues = this.auditForm.getRawValue();
  //   const payload = {
  //     capaId: formDataValues.capaId || 0,
  //     inspectionRefId: this.inspectionRefId,
  //     severityId: formDataValues.severityId ? Number(formDataValues.severityId) : null,
  //     occurrence: formDataValues.occurrence ? Number(formDataValues.occurrence) : null,
  //     detection: formDataValues.detection ? Number(formDataValues.detection) : null,
  //     sodScore: formDataValues.sodScore ? Number(formDataValues.sodScore) : null,
  //     subject: formDataValues.subject || '',
  //     dueDate: formDataValues.dueDate || null,
  //     completedDate: formDataValues.completedDate || null,
  //     pdcaStatus: formDataValues.pdcaStatus || null,

  //     // Pass mapped demerit value to the API (also keeping riskRating mapped just in case the backend wasn't updated)
  //     demerit: formDataValues.demerit || null,
  //     riskRating: formDataValues.demerit ? formDataValues.demerit.toString() : null,
  //     demeritId: formDataValues.demeritId ? Number(formDataValues.demeritId) : null,

  //     // demeritId: formDataValues.demeritId ? Number(formDataValues.demeritId) : null,

  //     class: formDataValues.class || null,
  //     actionType: formDataValues.actionType || null,
  //     capaSubject: formDataValues.capaSubject || null,
  //     observations: formDataValues.observations || null,
  //     correctiveActions: formDataValues.correctiveActions || null,
  //     supplierRemarks: formDataValues.supplierRemarks || null,

  //     occurrenceId: formDataValues.occurrenceId ? Number(formDataValues.occurrenceId) : null,
  //     detectionId: formDataValues.detectionId ? Number(formDataValues.detectionId) : null,
  //     createdBy: 1
  //   };

  //   const sendData = new FormData();
  //   sendData.append('jsonData', JSON.stringify(payload));

  //   // Append newly selected PDFs
  //   this.selectedFiles.forEach(file => {
  //     sendData.append('files', file);
  //   });

  //   // Append newly selected Images
  //   this.localImageFiles.forEach(file => {
  //     sendData.append('files', file);
  //   });

  //   this.inspectionService.saveCapa(sendData).subscribe({
  //     next: (res) => {
  //       this.alertService.createAlert("CAPA saved successfully!");
  //       this.isSaved = true;
  //       this.loadCapaDetails();
  //     },
  //     error: (err) => {
  //       console.error("Error saving CAPA", err);
  //       this.alertService.createAlert("Failed to save CAPA.");
  //     }
  //   });
  // }

  onSubmit(): void {
    if (this.isReadOnly && !this.isSupplier) {
      return;
    }

    const subjectVal = this.auditForm.get('subject')?.value;
    const logDateVal = this.auditForm.get('logDate')?.value;

    if (!subjectVal || subjectVal.trim() === '') {
      this.alertService.createAlert('CAPA Subject is mandatory.', 0);
      return;
    }

    if (!logDateVal || logDateVal.trim() === '') {
      this.alertService.createAlert('Log Date is mandatory.', 0);
      return;
    }

    if (this.auditForm.invalid) {
      this.alertService.createAlert("Please fill all required fields.", 0);
      return;
    }

    // 🔥 1. Grab the exact User ID from local storage
    const storedUserId = localStorage.getItem('UserId');
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;

    const formDataValues = this.auditForm.getRawValue();
    const payload = {
      capaId: formDataValues.capaId || 0,
      inspectionRefId: this.inspectionRefId,
      severityId: formDataValues.severityId ? Number(formDataValues.severityId) : null,
      occurrence: formDataValues.occurrence ? Number(formDataValues.occurrence) : null,
      detection: formDataValues.detection ? Number(formDataValues.detection) : null,
      sodScore: formDataValues.sodScore ? Number(formDataValues.sodScore) : null,
      subject: formDataValues.subject || '',
      createdDate: formDataValues.logDate || null,
      dueDate: formDataValues.dueDate || null,
      completedDate: formDataValues.completedDate || null,
      pdcaStatus: formDataValues.pdcaStatus || null,
      demerit: formDataValues.demerit || null,
      riskRating: formDataValues.demerit ? formDataValues.demerit.toString() : null,
      demeritId: formDataValues.demeritId ? Number(formDataValues.demeritId) : null,
      class: formDataValues.class || null,
      actionType: formDataValues.actionType || null,
      capaSubject: formDataValues.capaSubject || null,
      observations: formDataValues.observations || null,
      correctiveActions: formDataValues.correctiveActions || null,
      supplierRemarks: formDataValues.supplierRemarks || null,
      occurrenceId: formDataValues.occurrenceId ? Number(formDataValues.occurrenceId) : null,
      detectionId: formDataValues.detectionId ? Number(formDataValues.detectionId) : null,

      // 🔥 2. Explicitly send the User ID to the backend!
      createdBy: currentUserId,
      modifiedBy: currentUserId
    };

    const sendData = new FormData();
    sendData.append('jsonData', JSON.stringify(payload));

    // Append newly selected PDFs
    this.selectedFiles.forEach(file => {
      sendData.append('files', file);
    });

    // Append newly selected Images
    this.localImageFiles.forEach(file => {
      sendData.append('files', file);
    });

    this.inspectionService.saveCapa(sendData).subscribe({
      next: (res) => {
        this.alertService.createAlert("CAPA saved successfully!");
        this.isSaved = true;
        this.loadCapaDetails();
      },
      error: (err) => {
        console.error("Error saving CAPA", err);
        this.alertService.createAlert("Failed to save CAPA.");
      }
    });
  }

  // --- PDF / Document Logic ---
  onFilesSelected(event: any): void {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push(event.target.files[i]);
      }
    }
  }

  removeLocalFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  removeApiDoc(index: number): void {
    const doc = this.uploadedDocs[index];
    const capaId = this.auditForm.get('capaId')?.value;

    if (capaId > 0) {
      this.inspectionService.deleteCapaDocument({ capaId: capaId, fileUrl: doc.url }).subscribe({
        next: () => this.uploadedDocs.splice(index, 1),
        error: () => this.alertService.createAlert("Failed to delete document.")
      });
    } else {
      this.uploadedDocs.splice(index, 1);
    }
  }

  viewLocalFile(file: File): void {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  }

  addDocument(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.multiple = true;
    fileInput.onchange = (event: any) => {
      this.onFilesSelected(event);
    };
    fileInput.click();
  }

  viewApiDoc(url: string): void {
    window.open(url, '_blank');
  }

  // --- Image Upload Logic (Gallery) ---
  addImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.localImageFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.localImagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }

  removeApiImage(event: Event, index: number): void {
    event.stopPropagation(); // Prevent slideshow from opening
    const capaId = this.auditForm.get('capaId')?.value;
    const imageUrl = this.apiImages[index];

    if (capaId > 0) {
      this.inspectionService.deleteCapaDocument({ capaId: capaId, fileUrl: imageUrl }).subscribe({
        next: () => this.apiImages.splice(index, 1),
        error: () => this.alertService.createAlert("Failed to delete image.")
      });
    } else {
      this.apiImages.splice(index, 1);
    }
  }

  removeLocalImage(event: Event, index: number): void {
    event.stopPropagation(); // Prevent slideshow from opening
    this.localImageFiles.splice(index, 1);
    this.localImagePreviews.splice(index, 1);
  }

  // --- Slideshow Logic ---
  openSlideshow(index: number): void {
    if (this.slideshowImages.length > 0) {
      this.currentSlideIndex = index;
      this.isSlideshowOpen = true;
    }
  }

  closeSlideshow(): void {
    this.isSlideshowOpen = false;
  }

  prevSlide(event?: Event): void {
    if (event) event.stopPropagation();
    const len = this.slideshowImages.length;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + len) % len;
  }

  nextSlide(event?: Event): void {
    if (event) event.stopPropagation();
    const len = this.slideshowImages.length;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % len;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isSlideshowOpen) return;
    if (event.key === 'ArrowLeft') this.prevSlide();
    if (event.key === 'ArrowRight') this.nextSlide();
    if (event.key === 'Escape') this.closeSlideshow();
  }
}