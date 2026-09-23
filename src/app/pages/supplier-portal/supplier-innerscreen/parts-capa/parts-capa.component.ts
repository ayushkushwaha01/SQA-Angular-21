import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { PartAuditService } from 'src/app/pages/internal-portal/parts-audits/part-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  standalone: false,
  selector: 'app-parts-capa',
  templateUrl: './parts-capa.component.html',
  styleUrls: ['./parts-capa.component.scss']
})
export class PartsCapaComponent implements OnInit {
  auditForm!: FormGroup;

  pdcaOptions = ['Plan', 'Do', 'Check', 'Act'];
  severityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  occurrenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  detectionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // images: string[] = [
  //   'assets/img8.jpg',
  //   'assets/img-001.jpg',
  //   'assets/img-002.jpg',
  //   'assets/img-003.jpg',
  //   'assets/img5.jpg'
  // ];

  selectedClass: any;

  isSlideshowOpen = false;
  currentSlideIndex = 0;

  constructor(
    private fb: FormBuilder, private dialog: MatDialog,
    private location: Location, private partAuditService: PartAuditService, private alertService: AlertService,
    private setupService: SetupService, private route: ActivatedRoute
  ) { }
  partAuditId: number = 0;
  auditParameterId: number = 0;
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.partAuditId = +params['partAuditId'] || 0;
      this.auditParameterId = +params['auditParameterId'] || 0;

      console.log('PartAuditId:', this.partAuditId);
      console.log('AuditParameterId:', this.auditParameterId);

      this.initForm();
      this.setupScoreCalculation();
      this.getSeverities();
      this.getCapa();
      this.getDemeritMaster();




    });

  }

  goBack(): void {
    this.location.back();
  }



  severities: any[] = [];
  getSeverities() {
    this.setupService.getSeverities()
      .subscribe((res: any) => {
        if (res.success) {

          this.severities = res.data;

        }
      });
  }

  demeritOptions: any[] = [];
  getDemeritMaster() {

    this.setupService.getDemeritMaster({})
      .subscribe((res: any) => {

        if (res.success) {

          this.demeritOptions = res.data.data.map((item: any) => {

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


  initForm(): void {

    this.auditForm = this.fb.group({

      partAuditCapaId: [{ value: 0, disabled: true }],

      partAuditId: [
        { value: this.partAuditId, disabled: true }
      ],

      auditParameterId: [
        { value: this.auditParameterId, disabled: true }
      ],

      subject: [{ value: '', disabled: true }],

      dueDate: [{ value: '', disabled: true }],
      loggedDate: [{ value: '', disabled: true }],

      completedDate: [{ value: '', disabled: true }],

      pdcaStatus: [{ value: '', disabled: true }],

      severityId: [{ value: null, disabled: true }],

      occurrence: [{ value: null, disabled: true }],

      detection: [{ value: null, disabled: true }],

      sodScore: [{ value: '', disabled: true }],

      riskRating: [{ value: '', disabled: true }],

      isResolved: [{ value: false, disabled: true }],

      class: [{ value: '', disabled: true }],

      actionType: [{ value: '', disabled: true }],

      capaSubject: [{ value: '', disabled: true }],

      observations: [{ value: '', disabled: true }],
      demeritId: [{ value: '', disabled: true }],


      // correctiveActions: [{ value: '', disabled: true }],

      // ONLY THIS FIELD IS EDITABLE
      supplierRemarks: [''],
      correctiveActions: ['']

    });

  }
  save(): void {

    if (this.auditForm.invalid) {
      return;
    }

    const supplierId = Number(localStorage.getItem('UserId')) || 0;

    const payload = {
      ...this.auditForm.getRawValue(),
      modifiedBy: supplierId
    };

    console.log('CAPA Update Payload:', payload);

    this.partAuditService.upsertCapa(payload).subscribe({

      next: (res: any) => {

        if (res.success) {

          this.alertService.createAlert(res.message);

          this.auditForm.patchValue({
            partAuditCapaId: res.data.partAuditCapaId
          });

          if (this.selectedPdfFiles.length > 0) {
            this.uploadDocuments();
          }

          if (this.selectedImageFiles.length > 0) {
            this.uploadImages();
          }

        }

      },

      error: err => {
        console.error('CAPA update error:', err);
      }

    });

  }

  selectedPdfFiles: File[] = [];
  onPdfSelected(event: any) {

    if (event.target.files && event.target.files.length > 0) {

      const files = Array.from(event.target.files) as File[];

      files.forEach(file => {

        this.selectedPdfFiles.push(file);

        // show immediately in the grid, no docId yet since it's unsaved
        this.documents.push({
          docId: null,
          docTitlte: file.name,
          _file: file
        });

      });

    }

  }


  uploadDocuments() {

    const formData = new FormData();

    formData.append('partAuditId', this.partAuditId.toString());
    formData.append('auditParameterId', this.auditParameterId.toString());

    this.selectedPdfFiles.forEach(file => {
      formData.append('files', file);
    });

    this.partAuditService.upsertPartsAuditDoc(formData)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(res.message);

            this.selectedPdfFiles = [];

          }

        },

        error: err => console.error(err)

      });

  }


  selectedImageFiles: File[] = [];
  //images: string[] = [];

  onFileSelected(event: any) {

    if (event.target.files && event.target.files.length > 0) {

      const files = Array.from(event.target.files) as File[];

      files.forEach(file => {

        this.selectedImageFiles.push(file);

        const reader = new FileReader();

        reader.onload = () => {

          const base64 = reader.result as string;

          this.images.push(base64);

          // keep imageDetails in sync with images by index
          this.imageDetails.push({
            imageId: null,
            imageurl: base64
          });

        };

        reader.readAsDataURL(file);

      });

    }

  }

  uploadImages() {

    const formData = new FormData();

    formData.append('partAuditId', this.partAuditId.toString());
    formData.append('auditParameterId', this.auditParameterId.toString());

    this.selectedImageFiles.forEach(file => {
      formData.append('files', file);
    });

    this.partAuditService.upsertPartsAuditImages(formData)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(res.message);

            this.selectedImageFiles = [];

          }

        },

        error: err => console.error(err)

      });

  }
  setupScoreCalculation() {

    this.auditForm.get('severityId')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

    this.auditForm.get('occurrence')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

    this.auditForm.get('detection')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

  }
  calculateSodScore() {

    const severityId = this.auditForm.get('severityId')?.value;
    const occurrence = this.auditForm.get('occurrence')?.value ?? '';
    const detection = this.auditForm.get('detection')?.value ?? '';

    const severity = this.severities.find(x => x.severityId == severityId);

    const severityRating = severity?.rating ?? '';

    const sodScore = `${severityRating}${occurrence}${detection}`;

    this.auditForm.patchValue(
      {
        sodScore: sodScore
      },
      { emitEvent: false }
    );
  }


  documents: any[] = [];
  imageDetails: any[] = [];
  images: string[] = [];
  getCapa() {

    const filter = {
      auditParameterId: this.auditParameterId
    };

    this.partAuditService.getCapa(filter)
      .subscribe((res: any) => {

        if (!res.success || !res.data) {
          return;
        }

        const capa = res.data.capa;

        this.auditForm.patchValue({

          partAuditCapaId: capa.partAuditCapaId,
          partAuditId: capa.partAuditId,
          auditParameterId: capa.auditParameterId,
          subject: capa.subject,
          // dueDate: capa.dueDate,
          // completedDate: capa.completedDate,
          dueDate: capa.dueDate ? capa.dueDate.substring(0, 10) : '',

          completedDate: capa.completedDate
            ? capa.completedDate.substring(0, 10)
            : '',
          loggedDate: capa.createdDate
            ? capa.createdDate.substring(0, 10)
            : '',
          pdcaStatus: capa.pdcaStatus,
          severityId: capa.severityId,
          occurrence: capa.occurrence,
          detection: capa.detection,
          sodScore: capa.sodScore,
          riskRating: capa.riskRating,
          isResolved: capa.isResolved,
          class: capa.class,
          actionType: capa.actionType,
          capaSubject: capa.capaSubject,
          observations: capa.observations,
          correctiveActions: capa.correctiveActions,
          supplierRemarks: capa.supplierRemarks,
          demeritId: capa.demeritId


        });

        // Documents
        this.documents = res.data.documents || [];

        // Images for gallery
        this.imageDetails = res.data.images || [];

        this.images = this.imageDetails.map((x: any) => x.imageurl);

      });

  }





  openSlideshow(index: number): void {
    this.currentSlideIndex = index;
    this.isSlideshowOpen = true;
  }

  closeSlideshow(): void {
    this.isSlideshowOpen = false;
  }

  prevSlide(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.images.length) %
      this.images.length;
  }

  nextSlide(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.currentSlideIndex =
      (this.currentSlideIndex + 1) %
      this.images.length;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {

    if (!this.isSlideshowOpen) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.prevSlide();
    }

    if (event.key === 'ArrowRight') {
      this.nextSlide();
    }

    if (event.key === 'Escape') {
      this.closeSlideshow();
    }
  }

  onSubmit(): void {
    console.log(
      'Form Submitted',
      this.auditForm.getRawValue()
    );
  }

  openDocument(doc: any) {
    if (doc?.docurl) {
      window.open(doc.docurl, '_blank');
    }
  }

  deleteDocConfirmation(doc: any) {

    // Not yet saved (no docId) - just remove locally, no API call
    if (!doc?.docId) {

      this.documents = this.documents.filter((x: any) => x !== doc);

      const fileIndex = this.selectedPdfFiles.indexOf(doc._file);

      if (fileIndex > -1) {
        this.selectedPdfFiles.splice(fileIndex, 1);
      }

      return;

    }

    // Already saved - confirm and call delete API
    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      {
        width: 'auto',
        data: {
          component: null,
          title: 'Delete Confirmation',
          content: 'Are you sure you want to delete this document?',
          isConfirmation: true
        }
      }
    );

    dialogRef.afterClosed().subscribe((confirmed: any) => {

      if (!confirmed) {
        return;
      }

      const payload = {
        docId: doc.docId
      };

      this.partAuditService.deleteDoc(payload).subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(
              res.message || 'Document deleted successfully',
              1
            );

            this.documents = this.documents.filter(
              (x: any) => x.docId !== doc.docId
            );

          } else {

            this.alertService.createAlert(
              res.message || 'Failed to delete document',
              0
            );

          }

        },

        error: () => {

          this.alertService.createAlert(
            'Failed to delete document',
            0
          );

        }

      });

    });

  }
  deleteImageConfirmation(index: number) {

    const image = this.imageDetails[index];

    // Not yet saved (no imageId) - just remove locally, no API call
    if (!image?.imageId) {

      this.imageDetails.splice(index, 1);
      this.images.splice(index, 1);

      return;

    }

    // Already saved - confirm and call delete API
    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      {
        width: 'auto',
        data: {
          component: null,
          title: 'Delete Confirmation',
          content: 'Are you sure you want to delete this image?',
          isConfirmation: true
        }
      }
    );

    dialogRef.afterClosed().subscribe((confirmed: any) => {

      if (!confirmed) {
        return;
      }

      const payload = {
        imageId: image.imageId
      };

      this.partAuditService.deleteImage(payload).subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(
              res.message || 'Image deleted successfully',
              1
            );

            this.imageDetails = this.imageDetails.filter(
              (x: any) => x.imageId !== image.imageId
            );

            this.images = this.imageDetails.map(
              (x: any) => x.imageurl
            );

          } else {

            this.alertService.createAlert(
              res.message || 'Failed to delete image',
              0
            );

          }

        },

        error: () => {

          this.alertService.createAlert(
            'Failed to delete image',
            0
          );

        }

      });

    });

  }
}