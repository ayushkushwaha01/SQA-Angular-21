import { Component, OnInit } from '@angular/core';
import { AddVenderComponent } from './add-vender/add-vender.component';
import { MatDialog } from '@angular/material/dialog';

// Updated interface to exactly match your new table data
export interface VendorRating {
  id: number;
  ratings: string;
  processAuditMinScore: number;
  processAuditMaxScore: number;
  partsAuditMinScore: number;
  partsAuditMaxScore: number;
}

@Component({
  standalone: false,
  selector: 'app-vender-rating',
  templateUrl: './vender-rating.component.html',
  styleUrls: ['./vender-rating.component.scss']
})
export class VenderRatingComponent implements OnInit {
  // UI State
  showFilters: boolean = false;

  // Filter Models
  selectedKeyword: string = '';
  selectedStatus: string = '';

  // Data Stores
  originalData: VendorRating[] = []; 
  tableData: VendorRating[] = [];    

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    this.originalData = [
      { 
        id: 1, 
        ratings: 'Excellent', 
        processAuditMinScore: 90, 
        processAuditMaxScore: 100, 
        partsAuditMinScore: 95, 
        partsAuditMaxScore: 100 
      },
      { 
        id: 2, 
        ratings: 'Good Supplier', 
        processAuditMinScore: 80, 
        processAuditMaxScore: 89, 
        partsAuditMinScore: 85, 
        partsAuditMaxScore: 94 
      },
      { 
        id: 3, 
        ratings: 'Satisfactory', 
        processAuditMinScore: 70, 
        processAuditMaxScore: 79, 
        partsAuditMinScore: 75, 
        partsAuditMaxScore: 84 
      },
      { 
        id: 4, 
        ratings: 'Poor Supplier', 
        processAuditMinScore: 60, 
        processAuditMaxScore: 69, 
        partsAuditMinScore: 65, 
        partsAuditMaxScore: 74 
      },
      { 
        id: 5, 
        ratings: 'Develop or Out', 
        processAuditMinScore: 50, 
        processAuditMaxScore: 59, 
        partsAuditMinScore: 50, 
        partsAuditMaxScore: 64 
      }
    ];
    
    this.tableData = [...this.originalData];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  addCommodity(id: any): void {
    if (id) {
      console.log('Triggered Edit for ID:', id);
    } else {
      console.log('Triggered Add New Vendor');
    }
  }

  // Updated filter logic to work with the new interface properties
  onGo(): void {
    this.tableData = this.originalData.filter(item => {
      const keywordMatch = this.selectedKeyword 
        ? item.ratings.toLowerCase().includes(this.selectedKeyword.toLowerCase()) || 
          item.processAuditMinScore.toString().includes(this.selectedKeyword) ||
          item.processAuditMaxScore.toString().includes(this.selectedKeyword)
        : true;

      return keywordMatch;
    });
  }

  onClear(): void {
    this.selectedKeyword = '';
    this.selectedStatus = '';
    this.tableData = [...this.originalData];
  }













    addvender(data: any) {
      this.dialog.open(AddVenderComponent, {
        width: '700px',
        height: 'auto',
        data: data
      });
    }
}