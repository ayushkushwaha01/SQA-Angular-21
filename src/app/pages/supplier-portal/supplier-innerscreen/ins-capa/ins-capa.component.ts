import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-ins-capa',
  templateUrl: './ins-capa.component.html',
  styleUrls: ['./ins-capa.component.scss']
})
export class InsCapaComponent implements OnInit {


  auditForm!: FormGroup;

  pdcaOptions = ['Plan', 'Do', 'Check', 'Act'];
  severityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  occurrenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  detectionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  images: string[] = [
    'assets/img8.jpg',
    'assets/img-001.jpg',
    'assets/img-002.jpg',
    'assets/img-003.jpg',
    'assets/img5.jpg'
  ];

  selectedClass: any;

  isSlideshowOpen = false;
  currentSlideIndex = 0;

  constructor(
    private fb: FormBuilder,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupScoreCalculation();
  }

  goBack(): void {
    this.location.back();
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
      sodScore: [{ value: '842', disabled: true }],
      riskRating: [{ value: 'High', disabled: true }],
      isResolved: [false],
      observations: [''],
      correctiveActions: [''],
      supplierRemarks: ['']
    });
  }

  setupScoreCalculation(): void {
    this.auditForm.valueChanges.subscribe(values => {
      if (values.severity && values.occurrence && values.detection) {

        const sodStr = `${values.severity}${values.occurrence}${values.detection}`;

        this.auditForm.get('sodScore')?.setValue(
          sodStr,
          { emitEvent: false }
        );

        const risk = parseInt(sodStr, 10) > 500 ? 'High' : 'Low';

        this.auditForm.get('riskRating')?.setValue(
          risk,
          { emitEvent: false }
        );
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onload = () => {
        this.images.push(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
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
}
