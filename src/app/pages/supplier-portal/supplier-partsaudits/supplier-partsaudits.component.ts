import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-supplier-partsaudits',
  templateUrl: './supplier-partsaudits.component.html',
  styleUrls: ['./supplier-partsaudits.component.scss']
})
export class SupplierPartsauditsComponent implements OnInit {

  hideSidebar = false;
  isSidenavOpen = true;
  activeTab = 'sqmd'; // Can be 'sqmd', 'process', 'parts', or 'inspection'

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check initial route on load
    this.updateLayout(this.router.url);

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateLayout(event.urlAfterRedirects);
      });
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  openUserManual(fileName: string): void {
    window.open(`assets/${fileName}`, '_blank');
  }

  updateLayout(url: string) {
    // Hide sidebar entirely for specific inner screens
    this.hideSidebar = url.includes('reference') || url.includes('details') || url.includes('inspect-inner-screen');

    let newTab = 'sqmd';
    if (url.includes('/setup')) {
      newTab = 'setup';
    } else if (url.includes('/process')) {
      newTab = 'process';
    } else if (url.includes('/parts')) {
      newTab = 'parts';
    } else if (url.includes('/inspection') || url.includes('/inspect-inner-screen')) { 
      newTab = 'inspection';
    }

    // Auto-set isSidenavOpen when the TAB changes
    if (newTab !== this.activeTab) {
      if (newTab === 'sqmd' || newTab === 'setup') { 
        this.isSidenavOpen = false;
      } else {
        // Show sidenav for Process, Parts, AND Inspection
        this.isSidenavOpen = !this.hideSidebar;
      }
      
      // CRITICAL FIX: Update activeTab so the HTML *ngIf triggers
      this.activeTab = newTab; 
    }

    // Always hide if sidebar is forcibly hidden by inner routes
    if (this.hideSidebar) {
      this.isSidenavOpen = false;
    }
  }
}