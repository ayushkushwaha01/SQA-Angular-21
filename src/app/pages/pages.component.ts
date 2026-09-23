import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Settings, SettingsService } from '../services/settings.service';
import { MenuService } from '../services/menu.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SidenavComponent } from '../theme/components/sidenav/sidenav.component';
import { FullScreenComponent } from '../theme/components/fullscreen/fullscreen.component';
import { UserMenuComponent } from '../theme/components/user-menu/user-menu.component';
import { HorizontalMenuComponent } from '../theme/components/menu/horizontal-menu/horizontal-menu.component';
import { BreadcrumbComponent } from '../theme/components/breadcrumb/breadcrumb.component';
import { MessagesComponent } from '../theme/components/messages/messages.component';
import { SentMailsDialogComponent } from './login/sent-mails-dialog/sent-mails-dialog.component';
import { ManageUsersService } from './manage-users/manage-users.service';

@Component({
    selector: 'app-pages',
    imports: [
        RouterOutlet,
        FormsModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatBadgeModule,
        MatTooltipModule,
        MatDialogModule,
        FlexLayoutModule,
        NgScrollbarModule,
        SidenavComponent,
        FullScreenComponent,
        UserMenuComponent,
        HorizontalMenuComponent,
        BreadcrumbComponent,
        MessagesComponent
    ],
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.scss'
})
export class PagesComponent implements OnInit {
    @ViewChild('sidenav') sidenav: any;
    @ViewChild('backToTop') backToTop: any;
    @ViewChild('mainSidenavContent') mainSidenavContent: any;
    @ViewChild('mainContent') mainContent: ElementRef;

    public settings: Settings;
    public menus = ['vertical', 'horizontal'];
    public menuOption: string;
    public menuTypes = ['default', 'compact', 'mini'];
    public menuTypeOption: string;
    public lastScrollTop: number = 0;
    public showBackToTop: boolean = false;
    public toggleSearchBar: boolean = false;
    private defaultMenu: string;
    public showSidenav: boolean = false;
    public sentMailsCount: number = 0;

    constructor(
        public settingsService: SettingsService,
        public router: Router,
        private menuService: MenuService,
        private dialog: MatDialog,
        private manageUsersService: ManageUsersService
    ) {
        this.settings = this.settingsService.settings;
    }

    ngOnInit() {
        // FORCE HORIZONTAL MENU
        this.settings.menu = 'horizontal';
        this.settings.sidenavIsOpened = false;
        this.settings.sidenavIsPinned = false;
        this.menuOption = 'horizontal';
        this.menuTypeOption = this.settings.menuType;
        this.defaultMenu = 'horizontal';
        this.fetchSentMailsCount();
    }

    fetchSentMailsCount(): void {
        const storedUserId = localStorage.getItem('UserId');
        const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;
        const currentUserType = localStorage.getItem('UserType') || 'Internal';

        if (currentUserId === 0) return;

        this.manageUsersService.getSentMails(currentUserId, currentUserType).subscribe({
            next: (res: any) => {
                if (res.success && res.data) {
                    const list = res.data.filter((m: any) => m.moduleName !== 'System Escalation');
                    this.sentMailsCount = list.length;
                }
            },
            error: (err: any) => {
                console.error('Error fetching sent mails count', err);
            }
        });
    }

    openSentMails(): void {
        const dialogRef = this.dialog.open(SentMailsDialogComponent, {
            width: '900px',
            maxHeight: '90vh',
            panelClass: 'custom-dialog-container'
        });
        dialogRef.afterClosed().subscribe(() => {
            this.fetchSentMailsCount();
        });
    }

    ngAfterViewInit() {
        setTimeout(() => { this.settings.loadingSpinner = false }, 300);
        this.backToTop.nativeElement.style.display = 'none';
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                if (!this.settings.sidenavIsPinned && this.sidenav) {
                    this.sidenav.close();
                }
                if (window.innerWidth <= 768 && this.sidenav) {
                    this.sidenav.close();
                }
            }
        });
        if (this.settings.menu == "vertical") {
            this.menuService.expandActiveSubMenu(this.menuService.getVerticalMenuItems());
        }
    }

    public chooseMenu() {
        this.settings.menu = this.menuOption;
        this.defaultMenu = this.menuOption;
        this.router.navigate(['/']);
    }

    public chooseMenuType() {
        this.settings.menuType = this.menuTypeOption;
    }

    public changeTheme(theme: string) {
        this.settings.theme = theme;
    }

    public toggleSidenav() {
        this.sidenav.toggle();
    }

    public onPageScroll(event: any) {
        (event.target.scrollTop > 300) ? this.backToTop.nativeElement.style.display = 'flex' : this.backToTop.nativeElement.style.display = 'none';
    }

    public scrollToTop() {
        this.mainSidenavContent.scrollTo({
            top: 0
        });
        this.mainContent.nativeElement.scrollTo({
            duration: 100,
            top: 0
        });
    }

    public closeSubMenus() {
        let menu = document.querySelector(".sidenav-menu-outer");
        if (menu) {
            for (let i = 0; i < menu.children[0].children.length; i++) {
                let child = menu.children[0].children[i];
                if (child) {
                    if (child.children[0].classList.contains('expanded')) {
                        child.children[0].classList.remove('expanded');
                        child.children[1].classList.remove('show');
                    }
                }
            }
        }
    }
}