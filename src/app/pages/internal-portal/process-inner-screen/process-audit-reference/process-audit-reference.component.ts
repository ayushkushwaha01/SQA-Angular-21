import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/shared/alert.service';
import { ActivatedRoute } from '@angular/router';
import { ProcessAuditService } from '../../process-audits/process-audit.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service'; // 🔥 Import this

@Component({
  standalone: false,
  selector: 'app-process-audit-reference',
  templateUrl: './process-audit-reference.component.html',
  styleUrls: ['./process-audit-reference.component.scss']
})
export class ProcessAuditReferenceComponent implements OnInit {

  // 🔥 Permission variables for Screen ID 13 (Active Audit Dashboard)
  canRead: boolean = false;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  readonly SCREEN_ID: number = 13;
  isExistingRecord: boolean = false;

  get hasEditAccess(): boolean {
    return this.isExistingRecord ? this.canUpdate : this.canCreate;
  }

  isSaving: boolean = false; // Add loading state

  // 🔥 Filter Panel
  showFilter: boolean = false;
  filterCategory: any = null;
  filterCompliance: string = '';
  filterRating: string = '';
  filterSeverityId: any = null;
  allProcessSteps: any[] = []; // Stores unfiltered steps for reset

  // Dynamic Master Data
  categories: any[] = [];
  selectedCategory: any = null;
  processSteps: any[] = [];
  selectedStep: any = null;
  severities: any[] = [];
  parentAuditRef: string = 'Pending...';

  // // Dropdown Options
  // occurrences = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // detections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // NEW DYNAMIC ARRAYS
  occurrences: any[] = [];
  detections: any[] = [];

  pdcaStatuses = ['Plan', 'Do', 'Check', 'Act'];
  actionTypes = ['Containment', 'Corrective', 'Preventive'];
  classOptions = ['Regular', 'Important', 'Critical', 'Fitment', 'Safety'];

  // Form Bindings
  rating = 'NA';
  selectedSeverityId: any = null;

  selectedOccurrence: any = null;
  selectedDetection: any = null;
  complianceStatus: string = '';
  selectedClass = '';
  capaSubject = '';
  logDate: any = null
  dueDate: any = null;
  completedDate: any = null;
  pdcaStatus = '';
  isResolved = false;
  actionType = '';
  remarks = '';
  correctiveActions = '';
  supplierRemarks = '';

  targetCategoryId: any = null;  // 🔥 Add this
  targetChecklistId: any = null; // 🔥 Add this

  // File Upload Variables
  selectedFiles: File[] = [];
  selectedImageFiles: File[] = [];
  galleryImages: string[] = [];
  uploadedDocs: any[] = [];
  isSlideshowOpen = false;
  currentSlideIndex = 0;

  isSupplier: boolean = false;

  // Store question counts per category ID
  categoryCounts: { [key: number]: number } = {};

  // Store checklist responses & category statistics
  checklistResponses: { [checklistId: number]: any } = {};
  categoryStats: { [categoryId: number]: { attempted: number, total: number, hasFail: boolean } } = {};

  constructor(
    private location: Location,
    private api: ProcessAuditService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  // ngOnInit(): void {

  //   //Screen Permissions
  //   //  1. Load Permissions First
  //   this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
  //   this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
  //   this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
  //   this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

  //   // 2. Block page load if they cannot read
  //   if (!this.canRead) return;


  //   this.parentAuditRef = this.route.snapshot.queryParamMap.get('ref') || 'New Audit';
  //   this.targetCategoryId = this.route.snapshot.queryParamMap.get('categoryId'); 
  //   this.targetChecklistId = this.route.snapshot.queryParamMap.get('checklistId'); 

  //   // Check if the user is a supplier via Angular Router OR Raw URL
  //   this.route.queryParams.subscribe(params => {
  //     if (params['role'] === 'supplier') {
  //       this.isSupplier = true;
  //     }
  //   });
  //   if (window.location.href.toLowerCase().includes('role=supplier')) {
  //     this.isSupplier = true;
  //   }

  //   this.loadMasterData(); 
  // }

  ngOnInit(): void {
    // 🔥 1. Check if user is a Supplier FIRST
    this.isSupplier = localStorage.getItem('UserType') === 'Supplier' ||
      window.location.href.toLowerCase().includes('role=supplier');

    // 🔥 2. Apply Permissions based on User Type
    if (this.isSupplier) {
      // Suppliers ALWAYS have permission to read the page and update their CAPA responses
      this.canRead = true;
      this.canUpdate = true;
      this.canCreate = false; // Suppliers cannot create new audits
      this.canDelete = false; // Suppliers cannot delete
    }
    else {
      // Internal users get their permissions from the Database Setup Matrix
      this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
      this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
      this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
      this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    }

    // 3. Block page load if they truly cannot read
    if (!this.canRead) return;

    // 4. Load Route Parameters
    this.parentAuditRef = this.route.snapshot.queryParamMap.get('ref') || 'New Audit';
    this.targetCategoryId = this.route.snapshot.queryParamMap.get('categoryId');
    this.targetChecklistId = this.route.snapshot.queryParamMap.get('checklistId');

    // 5. Load Data
    this.loadMasterData();
  }

  loadMasterData() {
    const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');

    this.api.getSeverities().subscribe((res: any) => {
      if (res.success && res.data) {
        this.severities = res.data.sort((a: any, b: any) => Number(a.rating || 0) - Number(b.rating || 0));
      }
    });

    this.api.getOccurrences().subscribe((res: any) => {
      if (res.success && res.data) {
        this.occurrences = res.data.sort((a: any, b: any) => Number(a.rating || 0) - Number(b.rating || 0));
      }
    });

    this.api.getDetections().subscribe((res: any) => {
      if (res.success && res.data) {
        this.detections = res.data.sort((a: any, b: any) => Number(a.rating || 0) - Number(b.rating || 0));
      }
    });


    this.api.getProcessCategories().subscribe((res: any) => {
      if (res.success && res.data.length > 0) {
        this.categories = res.data;

        // Fetch checklist counts and responses for each category
        this.categories.forEach((cat: any) => {
          const catId = cat.processCategoryId;
          this.categoryStats[catId] = { attempted: 0, total: 0, hasFail: false };

          this.api.getChecklists(catId).subscribe((chkRes: any) => {
            if (chkRes.success && chkRes.data) {
              const checklists = chkRes.data;
              this.categoryCounts[catId] = checklists.length;
              this.categoryStats[catId].total = checklists.length;

              let loadedCount = 0;
              checklists.forEach((chk: any) => {
                const chkId = chk.checklistId;
                if (parentAuditId && chkId) {
                  this.api.getInnerScreenDetails(parentAuditId, chkId).subscribe((respRes: any) => {
                    loadedCount++;
                    if (respRes.success && respRes.data) {
                      const comp = respRes.data.compliance || '';
                      this.checklistResponses[chkId] = { compliance: comp, ...respRes.data };
                    } else {
                      this.checklistResponses[chkId] = { compliance: '' };
                    }
                    this.recalculateCategoryStats(catId, checklists);
                  });
                }
              });
            }
          });
        });

        // If a categoryId came from the URL, select it. Otherwise, select the first one.
        let catToSelect = this.categories[0];
        if (this.targetCategoryId) {
          const found = this.categories.find(c => c.processCategoryId == this.targetCategoryId);
          if (found) catToSelect = found;
        }

        this.selectCategory(catToSelect);
      }
    });
  }

  recalculateCategoryStats(categoryId: number, checklists: any[]) {
    let attempted = 0;
    let hasFail = false;

    checklists.forEach((chk: any) => {
      const chkId = chk.checklistId;
      const resp = this.checklistResponses[chkId];
      if (resp && resp.compliance && (resp.compliance === 'Pass' || resp.compliance === 'Fail')) {
        attempted++;
        if (resp.compliance === 'Fail') {
          hasFail = true;
        }
      }
    });

    this.categoryStats[categoryId] = {
      attempted: attempted,
      total: checklists.length,
      hasFail: hasFail
    };
  }

  getCategoryClass(cat: any): string {
    const catId = cat.processCategoryId;
    const isSelected = this.selectedCategory === cat;
    const hasFail = this.categoryStats[catId]?.hasFail || false;

    if (hasFail) {
      return isSelected ? 'category-btn-failed-active' : 'category-btn-failed-inactive';
    } else {
      return isSelected ? 'category-btn-active' : 'category-btn-inactive';
    }
  }

  getStepClass(step: any): string {
    const isSelected = this.selectedStep === step;
    const chkId = step?.checklistId;
    let r = '';

    if (isSelected) {
      r = this.rating;
    } else if (chkId && this.checklistResponses[chkId]) {
      r = this.checklistResponses[chkId].rating || '';
    }

    let colorClass = 'bg-grey text-dark';
    if (r === '5') {
      colorClass = 'bg-success text-white';
    } else if (r === '4') {
      colorClass = 'bg-primary text-white';
    } else if (r === '3') {
      colorClass = 'bg-warning text-dark';
    } else if (r === '2') {
      colorClass = 'bg-orange text-white';
    } else if (r === '1') {
      colorClass = 'bg-danger text-white';
    } else if (r === 'NA') {
      colorClass = 'bg-dark text-white';
    }

    return isSelected ? `${colorClass} selected-step` : colorClass;
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    this.processSteps = [];
    this.selectedStep = null;
    this.resetForm();

    this.api.getChecklists(category.processCategoryId).subscribe((res: any) => {
      if (res.success && res.data.length > 0) {
        this.processSteps = res.data;
        this.allProcessSteps = [...res.data]; // 🔥 Cache unfiltered steps

        let stepToSelect = this.processSteps[0];
        if (this.targetChecklistId) {
          const found = this.processSteps.find(s => s.checklistId == this.targetChecklistId);
          if (found) stepToSelect = found;

          // Clear the target ID so if the user clicks other tabs manually, it works normally
          this.targetChecklistId = null;
        }

        this.selectStep(stepToSelect);
      }
    });
  }

  selectStep(step: any) {
    this.selectedStep = step;
    this.loadSavedResponse();
  }

  // loadSavedResponse() {
  //   const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');
  //   const chkId = this.selectedStep?.checklistId;

  //   if (!parentAuditId || !chkId) return;

  //   // ⚡ INSTANT POPULATION FROM MEMORY CACHE (0ms lag!)
  //   if (this.checklistResponses[chkId] && this.checklistResponses[chkId].compliance !== undefined) {
  //     this.populateFormFromData(this.checklistResponses[chkId]);
  //   }

  //   // Refresh from API in background to ensure latest sync
  //   this.api.getInnerScreenDetails(parentAuditId, chkId).subscribe((res: any) => {
  //     if (res.success && res.data) {
  //       const d = res.data;
  //       this.checklistResponses[chkId] = { compliance: d.compliance || '', ...d };
  //       this.populateFormFromData(d);
  //       if (this.selectedCategory) {
  //         this.recalculateCategoryStats(this.selectedCategory.processCategoryId, this.processSteps);
  //       }
  //     } else if (!this.checklistResponses[chkId]) {
  //       this.resetForm();
  //     }
  //   });
  // }

  loadSavedResponse() {
    const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');
    const chkId = this.selectedStep?.checklistId;

    if (!parentAuditId || !chkId) return;

    // 1. INSTANT POPULATION FROM MEMORY CACHE OR RESET FORM
    if (this.checklistResponses[chkId] && this.checklistResponses[chkId].compliance) {
      this.isExistingRecord = true; // Memory says it exists
      this.populateFormFromData(this.checklistResponses[chkId]);
    } else {
      this.isExistingRecord = false; // Memory says it's new
      this.resetForm(); // 🔥 Reset form so previous question's data doesn't leak
    }

    // 2. REFRESH FROM API
    this.api.getInnerScreenDetails(parentAuditId, chkId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.isExistingRecord = true; // 🔥 API confirms it is an EXISTING record
        const d = res.data;
        this.checklistResponses[chkId] = { compliance: d.compliance || '', ...d };
        this.populateFormFromData(d);
        if (this.selectedCategory) {
          this.recalculateCategoryStats(this.selectedCategory.processCategoryId, this.processSteps);
        }
      } else {
        this.isExistingRecord = false; // 🔥 API confirms it is a NEW record
        this.resetForm(); // 🔥 Always reset form when no saved record exists
      }
    });
  }

  populateFormFromData(d: any) {
    this.rating = d.rating || 'NA';
    this.selectedSeverityId = d.severityId;
    this.selectedOccurrence = d.occurrence;
    this.selectedDetection = d.detection;
    this.complianceStatus = d.compliance || '';

    // CAPA fields
    this.selectedClass = d.class || '';
    this.capaSubject = d.capaSubject || '';
    this.pdcaStatus = d.pdcaStatus || '';
    this.isResolved = d.isResolved || false;
    this.actionType = d.actionType || '';
    this.remarks = d.remarks || '';
    this.correctiveActions = d.correctiveActions || '';
    this.supplierRemarks = d.supplierRemarks || '';

    this.logDate = d.createdDate ? this.formatDateForInput(d.createdDate) : this.getTodayDateString();

    // Format dates correctly for HTML <input type="date">
    this.dueDate = d.dueDate ? this.formatDateForInput(d.dueDate) : null;
    this.completedDate = d.completedDate ? this.formatDateForInput(d.completedDate) : null;

    // Clear local arrays on reload
    this.selectedFiles = [];
    this.selectedImageFiles = [];

    this.galleryImages = [];
    this.uploadedDocs = [];

    // Parse Images
    if (d.imageDocs) {
      const allImages = d.imageDocs.split(',');
      allImages.forEach((url: string) => {
        url = url.trim();
        if (url) this.galleryImages.push(url);
      });
    }

    // Parse Documents (PDFs, docs, etc.)
    if (d.pdfDocs) {
      const allDocs = d.pdfDocs.split(',');
      allDocs.forEach((url: string) => {
        url = url.trim();
        if (url) this.uploadedDocs.push({ url: url, title: url.split('/').pop()?.split('?')[0] || 'Document' });
      });
    }
  }

  // setRating(val: string) {
  //   // if (this.isSupplier) return;  
  //   if (this.isSupplier || !this.canUpdate) return;
  //   this.rating = val;
  //   if (this.selectedStep?.checklistId) {
  //     const chkId = this.selectedStep.checklistId;
  //     this.checklistResponses[chkId] = {
  //       ...this.checklistResponses[chkId],
  //       rating: val
  //     };
  //   }
  // }
  setRating(val: string) {
    // 🔥 Block if supplier OR if user lacks the correct access (Create vs Update)
    if (this.isSupplier || !this.hasEditAccess) return;
    this.rating = val;
    if (this.selectedStep?.checklistId) {
      const chkId = this.selectedStep.checklistId;
      this.checklistResponses[chkId] = {
        ...this.checklistResponses[chkId],
        rating: val
      };
    }
  }

  // --- Dynamic SOD Calculation ---
  get sodScore(): string {
    if (!this.selectedSeverityId || !this.selectedOccurrence || !this.selectedDetection) return '';

    // Find the actual rating value from the severity master
    const severity = this.severities.find(s => s.severityId === this.selectedSeverityId);
    const severityVal = severity ? severity.rating : 0;

    return `${severityVal}${this.selectedOccurrence}${this.selectedDetection}`;
  }

  // --- File Upload Logic (PDFs / General Docs) ---
  onFileSelected(event: any): void { if (event.target.files) this.addFiles(event.target.files); }
  onDragOver(event: any): void { event.preventDefault(); event.stopPropagation(); event.currentTarget.classList.add('drag-over'); }
  onDragLeave(event: any): void { event.preventDefault(); event.stopPropagation(); event.currentTarget.classList.remove('drag-over'); }
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    if (event.dataTransfer.files) this.addFiles(event.dataTransfer.files);
  }
  addFiles(files: FileList): void { for (let i = 0; i < files.length; i++) this.selectedFiles.push(files[i]); }
  removeFile(index: number): void { this.selectedFiles.splice(index, 1); }

  removeApiDoc(index: number): void {
    this.uploadedDocs.splice(index, 1);
    // You might also need an API call here to delete the doc if required by backend,
    // or just re-upload current files on save. For now, it removes it from UI.
  }

  viewLocalFile(file: File): void {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  }

  openDocUrl(url: string): void {
    if (url) window.open(url, '_blank');
  }

  // --- Image Upload Logic (Gallery) ---
  addImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {

        this.selectedImageFiles.push(file);

        const reader = new FileReader();
        reader.onload = () => { this.galleryImages.push(reader.result as string); }; // Local Preview
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }


  // --- Slideshow Logic ---
  openSlideshow(index: number): void { if (this.galleryImages.length > 0) { this.currentSlideIndex = index; this.isSlideshowOpen = true; } }
  closeSlideshow(): void { this.isSlideshowOpen = false; }
  prevSlide(event?: Event): void { if (event) event.stopPropagation(); this.currentSlideIndex = (this.currentSlideIndex - 1 + this.galleryImages.length) % this.galleryImages.length; }
  nextSlide(event?: Event): void { if (event) event.stopPropagation(); this.currentSlideIndex = (this.currentSlideIndex + 1) % this.galleryImages.length; }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isSlideshowOpen) return;
    if (event.key === 'ArrowLeft') this.prevSlide();
    if (event.key === 'ArrowRight') this.nextSlide();
    if (event.key === 'Escape') this.closeSlideshow();
  }

  goBack(): void { this.location.back(); }

  // --- FILTER PANEL METHODS ---
  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  applyFilter(): void {
    if (this.filterCategory && this.filterCategory !== this.selectedCategory) {
      this.selectCategory(this.filterCategory);
      setTimeout(() => this.filterSteps(), 500);
    } else {
      this.filterSteps();
    }
  }

  filterSteps(): void {
    if (this.allProcessSteps.length === 0 && this.processSteps.length > 0) {
      this.allProcessSteps = [...this.processSteps];
    }

    let filtered = [...this.allProcessSteps];

    if (this.filterCompliance) {
      filtered = filtered.filter(step => {
        const resp = this.checklistResponses[step.checklistId];
        return resp && resp.compliance === this.filterCompliance;
      });
    }

    if (this.filterRating) {
      filtered = filtered.filter(step => {
        const resp = this.checklistResponses[step.checklistId];
        return resp && resp.rating === this.filterRating;
      });
    }

    if (this.filterSeverityId) {
      filtered = filtered.filter(step => {
        const resp = this.checklistResponses[step.checklistId];
        return resp && resp.severityId === this.filterSeverityId;
      });
    }

    this.processSteps = filtered;

    if (this.processSteps.length > 0) {
      this.selectStep(this.processSteps[0]);
    }

    this.alertService.createAlert(`Found ${filtered.length} matching checklist(s)`, 1);
  }

  clearFilter(): void {
    this.filterCategory = null;
    this.filterCompliance = '';
    this.filterRating = '';
    this.filterSeverityId = null;

    if (this.allProcessSteps.length > 0) {
      this.processSteps = [...this.allProcessSteps];
      this.allProcessSteps = [];
      if (this.processSteps.length > 0) {
        this.selectStep(this.processSteps[0]);
      }
    }
  }

  // --- SAVE RECORD ---


  // saveData() {
  //   if (!this.isSupplier && (!this.complianceStatus || this.complianceStatus.trim() === '')) {
  //     this.alertService.createAlert('Compliance (Pass/Fail) is mandatory.', 0);
  //     return;
  //   }

  //   if (this.complianceStatus === 'Fail' && !this.isSupplier) {
  //     if (!this.capaSubject || this.capaSubject.trim() === '') {
  //       this.alertService.createAlert('CAPA Subject is mandatory when Compliance is Fail.', 0);
  //       return;
  //     }
  //   }

  //   const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');

  //   const payload = {
  //     processAuditId: parentAuditId,
  //     processCategoryId: this.selectedCategory?.processCategoryId,
  //     checklistId: this.selectedStep?.checklistId,
  //     guideline: this.selectedStep?.guideline,
  //     rating: this.rating,
  //     severityId: this.selectedSeverityId,
  //     occurrence: this.selectedOccurrence,
  //     detection: this.selectedDetection,
  //     compliance: this.complianceStatus,

  //     // CAPA fields
  //     class: this.selectedClass,
  //     capaSubject: this.capaSubject,
  //     dueDate: this.dueDate,
  //     completedDate: this.completedDate,
  //     pdcaStatus: this.pdcaStatus,
  //     isResolved: this.isResolved,
  //     actionType: this.actionType,
  //     remarks: this.remarks,
  //     correctiveActions: this.correctiveActions,
  //     supplierRemarks: this.supplierRemarks
  //   };

  //   const formData = new FormData();
  //   formData.append('jsonData', JSON.stringify(payload));

  //   // Append both file arrays separately so backend receives all uploads
  //   this.selectedFiles.forEach(file => { 
  //     formData.append('files', file); 
  //   });
  //   this.selectedImageFiles.forEach(file => { 
  //     formData.append('files', file); 
  //   });

  //   this.isSaving = true;

  //   this.api.saveInnerScreenDetails(formData).subscribe({
  //     next: (res: any) => {
  //       this.isSaving = false;
  //       if (res.success) {
  //         // Clear local selected files immediately to avoid duplicate UI display before refresh
  //         this.selectedFiles = [];
  //         this.selectedImageFiles = [];

  //         // Update cache & category stats
  //         if (this.selectedStep?.checklistId) {
  //           this.checklistResponses[this.selectedStep.checklistId] = {
  //             ...this.checklistResponses[this.selectedStep.checklistId],
  //             ...payload,
  //             compliance: this.complianceStatus
  //           };
  //         }
  //         if (this.selectedCategory) {
  //           this.recalculateCategoryStats(this.selectedCategory.processCategoryId, this.processSteps);
  //         }

  //         this.alertService.createAlert(res.message, 1);
  //         this.loadSavedResponse(); 
  //       } else {
  //         this.alertService.createAlert(res.message || 'Error saving response', 0);
  //       }
  //     },
  //     error: () => {
  //       this.isSaving = false;
  //       this.alertService.createAlert('Error saving response', 0);
  //     }
  //   });
  // }

  saveData() {
    if (!this.isSupplier && (!this.complianceStatus || this.complianceStatus.trim() === '')) {
      this.alertService.createAlert('Compliance (Pass/Fail) is mandatory.', 0);
      return;
    }

    if (this.complianceStatus === 'Fail' && !this.isSupplier) {
      if (!this.capaSubject || this.capaSubject.trim() === '') {
        this.alertService.createAlert('CAPA Subject is mandatory when Compliance is Fail.', 0);
        return;
      }
    }

    const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');

    // 🔥 FIX: Grab the exact User ID from local storage
    const storedUserId = localStorage.getItem('UserId');
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;

    const payload = {
      processAuditId: parentAuditId,
      processCategoryId: this.selectedCategory?.processCategoryId,
      checklistId: this.selectedStep?.checklistId,
      guideline: this.selectedStep?.guideline,
      rating: this.rating,
      severityId: this.selectedSeverityId,
      occurrence: this.selectedOccurrence,
      detection: this.selectedDetection,
      compliance: this.complianceStatus,

      // CAPA fields
      class: this.selectedClass,
      capaSubject: this.capaSubject,
      createdDate: this.logDate,
      dueDate: this.dueDate,
      completedDate: this.completedDate,
      pdcaStatus: this.pdcaStatus,
      isResolved: this.isResolved,
      actionType: this.actionType,
      remarks: this.remarks,
      correctiveActions: this.correctiveActions,
      supplierRemarks: this.supplierRemarks,

      // 🔥 FIX: Send User ID directly to the backend
      createdBy: currentUserId,
      modifiedBy: currentUserId
    };

    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(payload));

    // Append both file arrays separately so backend receives all uploads
    this.selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    this.selectedImageFiles.forEach(file => {
      formData.append('files', file);
    });

    this.isSaving = true;

    this.api.saveInnerScreenDetails(formData).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.success) {
          // Clear local selected files immediately to avoid duplicate UI display before refresh
          this.selectedFiles = [];
          this.selectedImageFiles = [];

          // Update cache & category stats
          if (this.selectedStep?.checklistId) {
            this.checklistResponses[this.selectedStep.checklistId] = {
              ...this.checklistResponses[this.selectedStep.checklistId],
              ...payload,
              compliance: this.complianceStatus
            };
          }
          if (this.selectedCategory) {
            this.recalculateCategoryStats(this.selectedCategory.processCategoryId, this.processSteps);
          }

          this.alertService.createAlert(res.message, 1);
          this.loadSavedResponse();
        } else {
          this.alertService.createAlert(res.message || 'Error saving response', 0);
        }
      },
      error: () => {
        this.isSaving = false;
        this.alertService.createAlert('Error saving response', 0);
      }
    });
  }

  // resetForm() {
  //   this.rating = '5';
  //   this.selectedSeverityId = null;
  //   this.selectedOccurrence = null;
  //   this.selectedDetection = null;
  //   this.complianceStatus = '';

  //   this.selectedClass = '';
  //   this.capaSubject = '';
  //   this.dueDate = null;
  //   this.completedDate = null;
  //   this.pdcaStatus = '';
  //   this.isResolved = false;
  //   this.actionType = '';
  //   this.remarks = '';
  //   this.correctiveActions = '';
  //   this.supplierRemarks = '';

  //   this.selectedFiles = [];
  //   this.selectedImageFiles = []; 
  //   this.galleryImages = [];
  //   this.uploadedDocs = [];
  // }

  resetForm() {
    this.isExistingRecord = false; // 🔥 Reset to new record state
    this.rating = 'NA';
    this.selectedSeverityId = null;
    this.selectedOccurrence = null;
    this.selectedDetection = null;
    this.complianceStatus = '';

    this.selectedClass = '';
    this.capaSubject = '';

    this.logDate = this.getTodayDateString();
    this.dueDate = null;
    this.completedDate = null;
    this.pdcaStatus = '';
    this.isResolved = false;
    this.actionType = '';
    this.remarks = '';
    this.correctiveActions = '';
    this.supplierRemarks = '';

    this.selectedFiles = [];
    this.selectedImageFiles = [];
    this.galleryImages = [];
    this.uploadedDocs = [];
  }

  formatDateForInput(dateVal: any): string | null {
    if (!dateVal) return null;
    if (typeof dateVal === 'string') {
      const match = dateVal.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Add this method inside ProcessAuditReferenceComponent class

  // deleteImage(index: number, imgUrl: string): void {
  //   // 1. If it's a local Base64 preview that hasn't been saved to DB yet
  //   if (imgUrl.startsWith('data:')) {
  //     this.galleryImages.splice(index, 1);
  //     const localIndex = this.selectedImageFiles.length - (this.galleryImages.length - index) - 1;
  //     if (localIndex >= 0) {
  //       this.selectedImageFiles.splice(localIndex, 1);
  //     }
  //     return;
  //   }

  //   // 2. Safely grab the IDs even after a page refresh
  //   const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');
  //   // 🔥 FIXED: Changed this.checklistId to this.targetChecklistId
  //   const stepChecklistId = this.selectedStep?.checklistId || this.selectedStep?.ChecklistId || this.targetChecklistId;

  //   if (!parentAuditId || !stepChecklistId) {
  //     this.alertService.createAlert('Cannot delete: Missing Audit or Checklist ID', 0);
  //     return;
  //   }

  //   const payload = {
  //     processAuditId: parentAuditId,
  //     checklistId: stepChecklistId,
  //     fileUrl: imgUrl
  //   };

  //   this.api.deleteInnerScreenDocument(payload).subscribe({
  //     next: (res: any) => {
  //       if (res.success) {
  //         this.alertService.createAlert('Image deleted successfully', 1);
  //         this.loadSavedResponse(); // 🔥 Reloads clean data from DB
  //       } else {
  //         this.alertService.createAlert(res.message || 'Failed to delete image', 0);
  //       }
  //     },
  //     error: () => this.alertService.createAlert('Error deleting image', 0)
  //   });
  // }

  deleteImage(index: number, imgUrl: string): void {
    if (!this.canDelete && !this.hasEditAccess && !imgUrl.startsWith('data:')) {
      this.alertService.createAlert('Access Denied: You cannot delete images.', 0);
      return;
    }

    // 1. Open the confirmation popup FIRST for ANY image
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: 'Are you sure you want to delete this image?',
        isConfirmation: true
      }
    });

    // 2. Only proceed if the user clicks "Yes / Confirm"
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // A. If it's a local Base64 preview that hasn't been saved to DB yet
        if (imgUrl.startsWith('data:')) {
          this.galleryImages.splice(index, 1);
          const localIndex = this.selectedImageFiles.length - (this.galleryImages.length - index) - 1;
          if (localIndex >= 0) {
            this.selectedImageFiles.splice(localIndex, 1);
          }
          this.alertService.createAlert('Image removed', 1);
          return;
        }

        // B. If it's an existing S3 image saved in the database
        const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');
        const stepChecklistId = this.selectedStep?.checklistId || this.selectedStep?.ChecklistId || this.targetChecklistId;

        if (!parentAuditId || !stepChecklistId) {
          this.alertService.createAlert('Cannot delete: Missing Audit or Checklist ID', 0);
          return;
        }

        const payload = {
          processAuditId: parentAuditId,
          checklistId: stepChecklistId,
          fileUrl: imgUrl
        };

        this.api.deleteInnerScreenDocument(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert('Image deleted successfully', 1);
              this.loadSavedResponse(); // Reload clean data from DB
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete image', 0);
            }
          },
          error: () => this.alertService.createAlert('Error deleting image', 0)
        });
      }
    });
  }

  // Replace removeApiDoc(index: number) with this:

  deleteDocument(index: number, doc: any): void {
    if (!this.canDelete && !this.hasEditAccess) {
      this.alertService.createAlert('Access Denied: You cannot delete documents.', 0);
      return;
    }

    // 1. Check if we have the required IDs before making an API call
    const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');
    const stepChecklistId = this.selectedStep?.checklistId || this.selectedStep?.ChecklistId || this.targetChecklistId;

    if (!parentAuditId || !stepChecklistId || !doc?.url) {
      // Fallback: If it's just a local item or IDs are missing, remove from UI array
      this.uploadedDocs.splice(index, 1);
      return;
    }

    // 2. Open confirmation popup
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: 'Are you sure you want to delete this document?',
        isConfirmation: true
      }
    });

    // 3. Call backend API if confirmed
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = {
          processAuditId: parentAuditId,
          checklistId: stepChecklistId,
          fileUrl: doc.url // Your backend C# RemoveKey() will match and remove this from PdfDocs
        };

        this.api.deleteInnerScreenDocument(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert('Document deleted successfully', 1);
              this.loadSavedResponse(); // 🔥 Reloads clean data directly from the DB
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete document', 0);
            }
          },
          error: () => this.alertService.createAlert('Error deleting document', 0)
        });
      }
    });
  }
}