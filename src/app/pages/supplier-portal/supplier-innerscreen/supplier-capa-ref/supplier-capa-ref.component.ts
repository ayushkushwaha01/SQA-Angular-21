import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-supplier-capa-ref',
  templateUrl: './supplier-capa-ref.component.html',
  styleUrls: ['./supplier-capa-ref.component.scss']
})
export class SupplierCapaRefComponent implements OnInit {

 categories = ['QMS(12)', 'MM(9)', 'PPC(18)', 'PM(13)', '5S(6)'];
  selectedCategory = 'QMS(12)';



  // Dictionary mapping each category to its specific set of 12 questions
  categoryQuestionsMap: { [key: string]: any[] } = {
    'QMS(12)': [
      {
        id: 1,
        tooltip: 'QMS',
        question: 'Is a documented and implemented Quality Management System (QMS) established and maintained in accordance with applicable automotive standards (e.g., IATF 16949 / ISO 9001)?'
      },
      {
        id: 2,
        tooltip: 'QMS',
        question: 'Are quality objectives, roles, responsibilities, and ownership clearly defined, communicated, and periodically reviewed?'
      },
      {
        id: 3,
        tooltip: 'QMS',
        question: 'Are controlled procedures, work instructions, and quality records maintained with proper revision and retention controls?'
      },
      {
        id: 4,
        tooltip: 'QMS',
        question: 'Are manufacturing and support processes documented with defined inputs, outputs, controls, and performance measures?'
      },
      {
        id: 5,
        tooltip: 'QMS',
        question: 'Is a formal change management process in place to assess, approve, validate, and document process or product changes?'
      },
      {
        id: 6,
        tooltip: 'QMS',
        question: 'Are process risks identified and managed using structured methods such as PFMEA, with mitigation actions tracked to closure?'
      },
      {
        id: 7,
        tooltip: 'QMS',
        question: 'Are internal audits conducted according to a defined schedule, and are findings effectively closed and verified?'
      },
      {
        id: 8,
        tooltip: 'QMS',
        question: 'Is there a structured corrective and preventive action (CAPA) process including root cause analysis and effectiveness validation?'
      },
      {
        id: 9,
        tooltip: 'QMS',
        question: 'Are customer complaints, nonconformities, and quality incidents analyzed and used for continuous improvement?'
      },
      {
        id: 10,
        tooltip: 'QMS',
        question: 'Are employees performing quality-related activities trained, competent, and periodically evaluated?'
      },
      {
        id: 11,
        tooltip: 'QMS',
        question: 'Are quality performance metrics (e.g., defects, rework, audit results, delivery quality) monitored and reviewed regularly?'
      },
      {
        id: 12,
        tooltip: 'QMS',
        question: 'Does management conduct periodic reviews of the QMS and ensure actions are taken for continual improvement?'
      }
    ],
    'MM(9)': [
      {
        id: 1,
        tooltip: 'MM',
        question: 'Is there a documented process for selection, qualification, approval, and periodic evaluation of material suppliers and sub-suppliers?'
      },
      {
        id: 2,
        tooltip: 'MM',
        question: 'Are material and sub-supplier requirements clearly defined through specifications, drawings, standards, and purchase agreements?'
      },
      {
        id: 3,
        tooltip: 'MM',
        question: 'Are incoming materials verified through inspection, testing, or certification before release to production?'
      },
      {
        id: 4,
        tooltip: 'MM',
        question: 'Is supplier performance monitored using defined KPIs such as quality, delivery, responsiveness, and defect rates?'
      },
      {
        id: 5,
        tooltip: 'MM',
        question: 'Are approved supplier lists (ASL) maintained, reviewed, and controlled to prevent unauthorized sourcing?'
      },
      {
        id: 6,
        tooltip: 'MM',
        question: 'Is material traceability maintained from receipt through production to finished product shipment?'
      },
      {
        id: 7,
        tooltip: 'MM',
        question: 'Are changes to raw materials, specifications, manufacturing location, process, or sub-suppliers formally reviewed and approved before implementation?'
      },
      {
        id: 8,
        tooltip: 'MM',
        question: 'Is there a process to manage supplier nonconformance, containment actions, corrective actions, and effectiveness verification?'
      },
      {
        id: 9,
        tooltip: 'MM',
        question: 'Are sub-suppliers required to comply with applicable customer, regulatory, and automotive quality requirements?'
      },
     
    ],
    'PPC(18)': [
      {
        id: 1,
        tooltip: 'PPC',
        question: 'Are production processes documented, standardized, and controlled through approved process flow diagrams, control plans, and work instructions?'
      },
      {
        id: 2,
        tooltip: 'PPC',
        question: 'Are critical process parameters identified, monitored, and maintained within defined operating limits?'
      },
      {
        id: 3,
        tooltip: 'PPC',
        question: 'Are production operators trained, qualified, and authorized for the processes they perform?'
      },
      {
        id: 4,
        tooltip: 'PPC',
        question: 'Are setup verification and first-off / first-piece approval activities performed before production release?'
      },
      {
        id: 5,
        tooltip: 'PPC',
        question: 'Are process controls implemented to prevent defects, including poka-yoke (error proofing) and automated detection methods where applicable?'
      },
      {
        id: 6,
        tooltip: 'PPC',
        question: 'Are in-process inspections and quality checks performed at defined frequencies and recorded appropriately?'
      },
      {
        id: 7,
        tooltip: 'PPC',
        question: 'Is process capability monitored (e.g., Cp/Cpk or equivalent), and are corrective actions initiated when performance falls below targets?'
      },
      {
        id: 8,
        tooltip: 'PPC',
        question: 'Are nonconforming products identified, segregated, controlled, and prevented from unintended use or shipment?'
      },
      {
        id: 9,
        tooltip: 'PPC',
        question: 'Is production equipment maintained through preventive or predictive maintenance programs to ensure process stability?'
      },
      {
        id: 10,
        tooltip: 'PPC',
        question: 'Are production changes (equipment, tooling, process, layout, parameters, personnel, or software) formally reviewed, validated, and approved before implementation?'
      },
      {
        id: 11,
        tooltip: 'PPC',
        question: 'Are product identification and traceability maintained throughout the production process and linked to manufacturing records?'
      },
      {
        id: 12,
        tooltip: 'PPC',
        question: 'Are production performance indicators (yield, scrap, downtime, defects, rework, OEE, etc.) monitored and used for continual process improvement?'
      },
      {
        id: 13,
        tooltip: 'PPC',
        question: 'Are process audit schedules defined and executed to verify ongoing compliance with control plans and work instructions?'
      },
      {
        id: 14,
        tooltip: 'PPC',
        question: 'Are reaction plans defined and followed when process parameters or quality characteristics go out of control?'
      },
      {
        id: 15,
        tooltip: 'PPC',
        question: 'Are measurement systems (gauges, fixtures, test equipment) validated through MSA (Measurement System Analysis) studies?'
      },
      {
        id: 16,
        tooltip: 'PPC',
        question: 'Are production handover and shift changeover processes controlled to prevent quality escapes or information gaps between shifts?'
      },
      {
        id: 17,
        tooltip: 'PPC',
        question: 'Are customer-specific requirements (CSRs) identified, documented, and incorporated into production control plans and work instructions?'
      },
      {
        id: 18,
        tooltip: 'PPC',
        question: 'Are lessons learned from past nonconformances, customer returns, and process failures captured and applied to prevent recurrence in current production?'
      }
    ],
    'PM(13)': [
      {
        id: 1,
        tooltip: 'IME',
        question: 'Is there a documented preventive maintenance program covering production equipment, tooling, utilities, and critical assets?'
      },
      {
        id: 2,
        tooltip: 'IME',
        question: 'Are maintenance schedules established based on manufacturer recommendations, usage, risk, and historical performance?'
      },
      {
        id: 3,
        tooltip: 'IME',
        question: 'Are preventive maintenance activities performed as planned and recorded with completion evidence?'
      },
      {
        id: 4,
        tooltip: 'IME',
        question: 'Are equipment maintenance histories maintained, including breakdowns, repairs, replacement parts, and recurring issues?'
      },
      {
        id: 5,
        tooltip: 'IME',
        question: 'Are critical machines and equipment identified, with prioritized maintenance plans to minimize production and quality risks?'
      },
      {
        id: 6,
        tooltip: 'IME',
        question: 'Are maintenance procedures standardized and supported by approved work instructions and checklists?'
      },
      {
        id: 7,
        tooltip: 'IME',
        question: 'Are maintenance personnel trained and qualified to perform preventive maintenance activities?'
      },
      {
        id: 8,
        tooltip: 'IME',
        question: 'Are equipment calibration, inspection, lubrication, cleaning, and adjustment activities included in the maintenance program where applicable?'
      },
      {
        id: 9,
        tooltip: 'IME',
        question: 'Is equipment condition monitored using preventive or predictive methods (e.g., condition monitoring, trend analysis, diagnostics)?'
      },
      {
        id: 10,
        tooltip: 'IME',
        question: 'Are maintenance-related process changes or equipment modifications reviewed, validated, and approved before returning equipment to production?'
      },
      {
        id: 11,
        tooltip: 'IME',
        question: 'Are spare parts for critical equipment identified, controlled, and available to support timely maintenance and recovery?'
      },
      {
        id: 12,
        tooltip: 'IME',
        question: 'Are preventive maintenance KPIs (e.g., downtime, MTBF, MTTR, schedule compliance, maintenance effectiveness) monitored and used for continuous improvement?'
      },
      {
        id: 13,
        tooltip: 'IME',
        question: 'Are breakdown analysis and root cause investigations conducted for recurring equipment failures, with findings used to update maintenance plans and prevent recurrence?'
      }
    ],
    'CAPA': [
      {
        id: 1,
        tooltip: 'CAPA',
        question: 'Is there a documented CAPA process defining responsibilities, timelines, escalation, and closure requirements?'
      },
      {
        id: 2,
        tooltip: 'CAPA',
        question: 'Are customer complaints, internal defects, audit findings, and process deviations formally captured and evaluated through the CAPA process?'
      },
      {
        id: 3,
        tooltip: 'CAPA',
        question: 'Are immediate containment actions implemented to control nonconforming products and prevent further impact?'
      },
      {
        id: 4,
        tooltip: 'CAPA',
        question: 'Is root cause analysis conducted using structured methodologies (e.g., 5 Why, Fishbone, 8D, Fault Tree Analysis)?'
      },
      {
        id: 5,
        tooltip: 'CAPA',
        question: 'Are corrective actions defined to eliminate identified root causes rather than address symptoms only?'
      },
      {
        id: 6,
        tooltip: 'CAPA',
        question: 'Are preventive actions implemented to avoid recurrence of similar issues across products, processes, or locations?'
      },
      {
        id: 7,
        tooltip: 'CAPA',
        question: 'Are CAPA actions assigned to responsible owners with defined target completion dates and progress tracking?'
      },
      {
        id: 8,
        tooltip: 'CAPA',
        question: 'Is effectiveness verification performed to confirm that implemented actions resolved the issue and prevented recurrence?'
      },
      {
        id: 9,
        tooltip: 'CAPA',
        question: 'Are lessons learned and CAPA outcomes incorporated into control plans, PFMEA, work instructions, and training materials?'
      },
      {
        id: 10,
        tooltip: 'CAPA',
        question: 'Are recurring issues analyzed using trend data and quality metrics to identify systemic improvement opportunities?'
      },
      {
        id: 11,
        tooltip: 'CAPA',
        question: 'Are changes resulting from CAPA formally reviewed, validated, documented, and approved before implementation?'
      },
      {
        id: 12,
        tooltip: 'CAPA',
        question: 'Are CAPA performance indicators (e.g., closure time, recurrence rate, overdue actions, effectiveness rate) monitored and reviewed for continual improvement?'
      }
    ],
    '5S(6)': [
      {
        id: 1,
        tooltip: '5S',
        question: 'Are 5S standards (Sort, Set in Order, Shine, Standardize, Sustain) documented, implemented, and communicated across production and support areas?'
      },
      {
        id: 2,
        tooltip: '5S',
        question: 'Are unnecessary materials, tools, equipment, and waste regularly identified and removed from work areas?'
      },
      {
        id: 3,
        tooltip: '5S',
        question: 'Are workstations, tools, materials, and storage locations clearly identified, labeled, and organized for efficient use?'
      },
      {
        id: 4,
        tooltip: '5S',
        question: 'Are production, storage, and common areas maintained in a clean and orderly condition to support product quality and safety?'
      },
      {
        id: 5,
        tooltip: '5S',
        question: 'Are cleaning activities scheduled, assigned, and documented with defined responsibilities?'
      },
      {
        id: 6,
        tooltip: '5S',
        question: 'Are visual controls (floor markings, labels, shadow boards, status indicators, signage) used to maintain workplace organization?'
      },
      // {
      //   id: 7,
      //   tooltip: '5S',
      //   question: 'Are materials, components, and finished goods stored appropriately to prevent contamination, damage, or mix-up?'
      // },
      // {
      //   id: 8,
      //   tooltip: '5S',
      //   question: 'Are aisles, emergency exits, equipment access points, and safety zones kept unobstructed and clearly marked?'
      // },
      // {
      //   id: 9,
      //   tooltip: '5S',
      //   question: 'Are abnormal conditions (leaks, spills, damaged equipment, excess inventory, clutter) identified and addressed promptly?'
      // },
      // {
      //   id: 10,
      //   tooltip: '5S',
      //   question: 'Are periodic 5S audits conducted and findings tracked through corrective actions to closure?'
      // },
      // {
      //   id: 11,
      //   tooltip: '5S',
      //   question: 'Are employees trained and actively participating in maintaining housekeeping and workplace discipline practices?'
      // },
      // {
      //   id: 12,
      //   tooltip: '5S',
      //   question: 'Are 5S performance indicators and continuous improvement activities reviewed regularly to sustain workplace standards?'
      // }
    ]
  };

  // Dictionary mapping each category to its specific guidelines
  categoryGuidelinesMap: { [key: string]: string[] } = {
    'QMS(12)': [
      'Verify QMS scope, documented procedures, process interactions, and controlled documentation.',
      'Ensure KPIs are established at process level with targets, ownership, and review cadence.',
      'Confirm organization chart, responsibility matrix (RACI), and escalation paths are available.'
    ],

    'MM(9)': [
      'Supplier Qualification â€“ Approve and monitor sub-suppliers based on quality, capability, and performance.',
      'Material Control & Traceability â€“ Inspect incoming materials and maintain full lot/batch traceability.',
      'Change & Risk Management â€“ Control supplier/material changes through approval and risk assessment.'
    ],

    'PPC(18)': [
      'Standardized Process Control â€“ Execute production using approved work instructions, control plans, and defined process parameters.',
      'In-Process Quality Monitoring â€“ Monitor critical process and quality characteristics with timely corrective actions for deviations.',
      'Process Stability & Traceability â€“ Maintain process capability, product traceability, and control of nonconforming output.'
    ],

    'PM(13)': [
      'Planned Maintenance Execution â€“ Perform preventive maintenance according to a defined schedule and documented procedures.',
      'Equipment Condition Monitoring â€“ Monitor equipment performance and address abnormalities before failure occurs.',
      'Maintenance Records & Effectiveness â€“ Maintain maintenance history and verify effectiveness to ensure process reliability.'
    ],

    'IME(13)': [
      'Issue Identification & Root Cause Analysis â€“ Capture nonconformities promptly and perform structured root cause analysis.',
      'Corrective & Preventive Action Implementation â€“ Define, implement, and track actions to eliminate recurrence and prevent occurrence.',
      'Effectiveness Verification & Closure â€“ Validate action effectiveness through monitoring and formally close CAPA records.'
    ],

    '5S(6)': [
      'Workplace Organization (5S Compliance) â€“ Maintain sorting, arrangement, cleanliness, standardization, and discipline across work areas.',
      'Visual Management & Identification â€“ Ensure clear labeling, material identification, and visual controls for efficient operations.',
      'Sustainment & Audit Control â€“ Conduct regular 5S audits and implement actions to sustain housekeeping standards.'
    ]
  };

  // The active list of 12 questions rendered in the HTML
  processSteps: any[] = [];
  selectedStep = 1;

  // Form Controls Models
  rating = '5';

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
    "assets/img8.jpg",
    "assets/img-001.jpg",
    "assets/img-002.jpg",
    "assets/img-003.jpg",
    "assets/img5.jpg",
  ];

  selectedFiles: File[] = [];
  complianceStatus: any;

  constructor(private location: Location) { }

  ngOnInit(): void {
    // Initialize the default questions on load
    this.processSteps = this.categoryQuestionsMap[this.selectedCategory];
  }

  goBack(): void {
    this.location.back();
  }

  // Set active category tab AND update the questions
  selectCategory(cat: string) {
    this.selectedCategory = cat;
    // Switch the array to match the selected category
    this.processSteps = this.categoryQuestionsMap[cat] || [];
    // Reset to the first step/question whenever category changes
    this.selectedStep = 1;
  }

  // Set active process step
  selectStep(id: number) {
    this.selectedStep = id;
  }

  // Helper method to retrieve the currently selected question string
  getSelectedQuestion(): string {
    const step = this.processSteps.find(s => s.id === this.selectedStep);
    return step ? step.question : '';
  }

  // Helper method to get the active guidelines array
  get currentGuidelines(): string[] {
    return this.categoryGuidelinesMap[this.selectedCategory] || [];
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

  // File Upload Handlers
  onFileSelected(event: any): void {
    if (event.target.files) {
      this.addFiles(event.target.files);
    }
  }

  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
  }

  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    if (event.dataTransfer.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  addFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  addImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        console.log(file);
        const reader = new FileReader();
        reader.onload = () => {
          const imageUrl = reader.result as string;
          // Pushes to mock array for preview 
          this.galleryImages.push(imageUrl);
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  }










  classOptions = ['Regular', 'Important', 'Critical', 'Fitment', 'Safety'];
  selectedClass = '';

  isSlideshowOpen = false;
  currentSlideIndex = 0;

  openSlideshow(index: number): void {
    if (this.galleryImages && this.galleryImages.length > 0) {
      this.currentSlideIndex = index;
      this.isSlideshowOpen = true;
    }
  }

  closeSlideshow(): void {
    this.isSlideshowOpen = false;
  }

  prevSlide(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.galleryImages.length) %
      this.galleryImages.length;
  }

  nextSlide(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.currentSlideIndex =
      (this.currentSlideIndex + 1) %
      this.galleryImages.length;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isSlideshowOpen) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        this.prevSlide();
        break;

      case 'ArrowRight':
        this.nextSlide();
        break;

      case 'Escape':
        this.closeSlideshow();
        break;
    }
  }
}
