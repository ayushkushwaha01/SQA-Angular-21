import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { PauditsNewAuditComponent } from './paudits-new-audit/paudits-new-audit.component';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PauditsHelpDeskComponent } from './paudits-help-desk/paudits-help-desk.component';

@Component({
  selector: 'app-process-audits',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './process-audits.component.html',
  styleUrls: ['./process-audits.component.scss']
})
export class ProcessAuditsComponent implements OnInit {

  hideSidebar = false;
  isSidenavOpen = true;

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hideSidebar = this.router.url.includes('reference') || this.router.url.includes('details');

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentUrl = event.urlAfterRedirects;
        this.hideSidebar = currentUrl.includes('reference') || currentUrl.includes('details');
      });
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  openaudit() {
    this.dialog.open(PauditsNewAuditComponent, {
      width: '600px',
      height: '400px',
      panelClass: 'no-scroll-dialog'
    });
  }

  openUserManual(fileName: string): void {
    const pdfUrl = `assets/${fileName}`; 
    window.open(pdfUrl, '_blank');
  }

  openHelpDesk(){
    this.dialog.open(PauditsHelpDeskComponent, {
      width: '650px',
      data: { module: 'Process Audits' }
    });
  }
}