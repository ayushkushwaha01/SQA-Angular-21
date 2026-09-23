import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-supplier-inspection',
  templateUrl: './supplier-inspection.component.html',
  styleUrls: ['./supplier-inspection.component.scss']
})
export class SupplierInspectionComponent implements OnInit {

  hideSidebar = false;
  isSidenavOpen = true;
  activeTab = 'inspection'; 

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
      
      // Update activeTab so the HTML *ngIf triggers
      this.activeTab = newTab; 
    }

    // Always hide if sidebar is forcibly hidden by inner routes
    if (this.hideSidebar) {
      this.isSidenavOpen = false;
    }
  }
}