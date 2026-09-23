import { OccurrenceMasterComponent } from './../../parts-audits/parts-setup/occurrence-master/occurrence-master.component';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartAuditService } from '../../parts-audits/part-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { ActivatedRoute } from '@angular/router';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-parts-audit-details',
  templateUrl: './parts-audit-details.component.html',
  styleUrls: ['./parts-audit-details.component.scss']
})
export class PartsAuditDetailsComponent implements OnInit {

  auditForm!: FormGroup;

  pdcaOptions = ['Plan', 'Do', 'Check', 'Act'];
  severityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  occurrenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  detectionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

   done: boolean = false;

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
  readonly SCREEN_ID: number = 41;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;


  constructor(
    private fb: FormBuilder, private dialog: MatDialog,
    private location: Location, private partAuditService: PartAuditService, private alertService: AlertService,
    private setupService: SetupService, private route: ActivatedRoute
  ) { }
  partAuditId: number = 0;
  auditParameterId: number = 0;
  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);


    this.route.queryParams.subscribe(params => {

      this.partAuditId = +params['partAuditId'] || 0;
      this.auditParameterId = +params['auditParameterId'] || 0;

      this.done = params['done'] === 'true';
      console.log('PartAuditId:', this.partAuditId);
      console.log('AuditParameterId:', this.auditParameterId);

      this.initForm();
      this.setupScoreCalculation();
      this.getSeverities();
      this.getCapa();
      this.getDemeritMaster();
      this.getOccurrences();
      this.getDetections();




    });

  }

  goBack(): void {
    this.location.back();
  }

  Demerits: any[] = [];
  demeritOptions: any[] = [];
  getDemeritMaster() {

    this.partAuditService.getDemeritDD()
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



  severities: any[] = [];
  getSeverities() {
    this.partAuditService.getSeverityDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.severities = res.data;

        }
      });
  }

  Occurrences: any[] = [];
  getOccurrences() {
    this.partAuditService.getOccurrenceDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.Occurrences = res.data;

        }
      });
  }
  detections: any[] = [];
  getDetections() {
    this.partAuditService.getDetectionDD()
      .subscribe((res: any) => {
        if (res.success) {

          this.detections = res.data;

        }
      });
  }


  // initForm(): void {

  //   this.auditForm = this.fb.group({

  //     partAuditCapaId: [0],

  //     partAuditId: [this.partAuditId],

  //     auditParameterId: [this.auditParameterId],
  //     subject: [''],

  //     dueDate: [''],

  //     completedDate: [''],
  //     loggedDate: [''],

  //     pdcaStatus: [''],

  //     severityId: [null],

  //     occurrence: [null],

  //     detection: [null],

  //     sodScore: [''],

  //     riskRating: [''],

  //     isResolved: [false],

  //     class: [''],

  //     actionType: [''],

  //     capaSubject: [''],

  //     observations: [''],

  //     correctiveActions: [''],

  //     supplierRemarks: [''],
  //     demeritId: [null],
  //     occurrenceId: [null],
  //     detectionId: [null]


  //   });

  // }

  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  initForm(): void {
    this.auditForm = this.fb.group({
      partAuditCapaId: [0],
      partAuditId: [this.partAuditId],
      auditParameterId: [this.auditParameterId],
      subject: [''],
      dueDate: [''],
      completedDate: [''],
      loggedDate: [this.getTodayDateString(), Validators.required],
      pdcaStatus: [''],
      severityId: [null],
      occurrence: [null],
      detection: [null],
      sodScore: [''],
      riskRating: [''],
      isResolved: [false],
      class: [''],
      actionType: [''],
      capaSubject: ['', Validators.required],
      observations: [''],
      correctiveActions: [''],
      supplierRemarks: [''],
      demeritId: [null],
      occurrenceId: [null],
      detectionId: [null],

      // 🔥 FIX: Explicitly register these so Angular sends them in the JSON payload
      createdBy: [0],
      modifiedBy: [0]
    });
  }
  Riskratings = [
    { label: 'Excellent', value: 5 },
    { label: 'Good', value: 4 },
    { label: 'Satisfactory', value: 3 },
    { label: 'Minor NC', value: 2 },
    { label: 'Major NC', value: 1 },
    { label: 'N/A', value: 0 }
  ];

  // save() {

  //   if (this.auditForm.invalid) {
  //     return;
  //   }

  //   const payload = this.auditForm.getRawValue();

  //   this.partAuditService.upsertCapa(payload).subscribe({

  //     next: (res: any) => {

  //       if (res.success) {

  //         this.alertService.createAlert(res.message);

  //         this.auditForm.patchValue({
  //           partAuditCapaId: res.data.partAuditCapaId
  //         });

  //         if (this.selectedPdfFiles.length > 0) {
  //           this.uploadDocuments();
  //         }

  //         if (this.selectedImageFiles.length > 0) {
  //           this.uploadImages();
  //         }

  //       }

  //     },

  //     error: err => console.error(err)

  //   });

  // }


  save() {
    const capaSubject = this.auditForm.get('capaSubject')?.value;
    const loggedDate = this.auditForm.get('loggedDate')?.value;

    if (!capaSubject || capaSubject.trim() === '') {
      this.alertService.createAlert('CAPA Subject is mandatory.', 0);
      return;
    }

    if (!loggedDate || loggedDate.trim() === '') {
      this.alertService.createAlert('Logged Date is mandatory.', 0);
      return;
    }

    if (this.auditForm.invalid) {
      return;
    }

    // Grab the exact User ID from local storage
    const storedUserId = localStorage.getItem('UserId');
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;

    // Safely patch the form with the User ID
    this.auditForm.patchValue({
      createdBy: currentUserId,
      modifiedBy: currentUserId
    });

    // Get the final payload and convert empty strings to null for optional dates & dropdowns
    const payload = this.auditForm.getRawValue();
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        payload[key] = null;
      }
    });

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
      error: err => console.error(err)
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

    this.auditForm.get('occurrenceId')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

    this.auditForm.get('detectionId')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

  }
  calculateSodScore(): void {

    const severityId = this.auditForm.get('severityId')?.value;
    const occurrenceId = this.auditForm.get('occurrenceId')?.value;
    const detectionId = this.auditForm.get('detectionId')?.value;

    const severity = this.severities.find(
      (x: any) => x.severityId === severityId
    );

    const occurrence = this.Occurrences.find(
      (x: any) => x.occurrenceId === occurrenceId
    );

    const detection = this.detections.find(
      (x: any) => x.detectionId === detectionId
    );

    const severityRating = severity?.rating;
    const occurrenceRating = occurrence?.rating;
    const detectionRating = detection?.rating;

    if (
      severityRating != null &&
      occurrenceRating != null &&
      detectionRating != null
    ) {

      const sodScore =
        `${severityRating}${occurrenceRating}${detectionRating}`;

      this.auditForm.patchValue({
        sodScore: sodScore
      });

    } else {

      this.auditForm.patchValue({
        sodScore: null
      });

    }
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
            : this.getTodayDateString(),
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
          demeritId: capa.demeritId,
          occurrenceId: capa.occurrenceId,
          detectionId: capa.detectionId

        });

        // Documents
        this.documents = res.data.documents || [];

        // Images for gallery
        this.imageDetails = res.data.images || [];

        this.images = this.imageDetails.map((x: any) => x.imageurl);

      });

  }



  changeResolvedStatus() {

    const dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: {
        component: null,
        title: 'Change Status Confirmation',
        content: `Are you sure you want to mark this record as ${this.auditForm.get('isResolved')?.value ? 'Not Resolved' : 'Resolved'
          }?`,
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) {
        return;
      }

      this.partAuditService.updateResolvedStatus({
        partAuditCapaId: this.auditForm.get('partAuditCapaId')?.value
      }).subscribe({

        next: (res: any) => {

          if (res.success) {

            this.auditForm.patchValue({
              isResolved: res.isResolved
            });

            this.alertService.createAlert(res.message, 1);

          } else {

            this.alertService.createAlert(res.message, 0);

          }

        },

        error: () => {

          this.alertService.createAlert('Something went wrong.', 0);

        }

      });

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