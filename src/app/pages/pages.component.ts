import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
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
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SidenavComponent } from '../theme/components/sidenav/sidenav.component';
import { FullScreenComponent } from '../theme/components/fullscreen/fullscreen.component';
import { UserMenuComponent } from '../theme/components/user-menu/user-menu.component';
import { HorizontalMenuComponent } from '../theme/components/menu/horizontal-menu/horizontal-menu.component';
import { BreadcrumbComponent } from '../theme/components/breadcrumb/breadcrumb.component';
import { MessagesComponent } from '../theme/components/messages/messages.component';
import { UserNotificationComponent } from '../theme/components/notification/user-notification/user-notification.component';
import { ManageUsersService } from './manage-users/manage-users.service';


@Component({
    selector: 'app-pages',
    imports: [
        CommonModule,
        RouterOutlet,
        RouterModule,
        FormsModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatBadgeModule,
        MatTooltipModule,
        FlexLayoutModule,
        NgScrollbarModule,
        SidenavComponent,
        FullScreenComponent,
        UserMenuComponent,
        HorizontalMenuComponent,
        BreadcrumbComponent,
        MessagesComponent,
        UserNotificationComponent
    ],
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.scss'
})
export class PagesComponent implements OnInit, OnDestroy {
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
    private countSub?: Subscription;
    private routerSub?: Subscription;
    private storageListener?: (e: StorageEvent) => void;
    private pollTimer: any = null;
    private pollAttempts = 0;
    private readonly MAX_POLL_ATTEMPTS = 12;

    constructor(
        public settingsService: SettingsService,
        public router: Router,
        private menuService: MenuService,
        private manageUsersService: ManageUsersService,
        private cdr: ChangeDetectorRef
    ) {
        this.settings = this.settingsService.settings;
    }

    ngOnInit() {
        this.settings.menu = 'horizontal';
        this.settings.sidenavIsOpened = false;
        this.settings.sidenavIsPinned = false;
        this.menuOption = 'horizontal';
        this.menuTypeOption = this.settings.menuType;
        this.defaultMenu = 'horizontal';

        this.countSub = this.manageUsersService.sentMailsCount$.subscribe(count => {
            this.sentMailsCount = count;
            this.cdr.markForCheck();
        });

        const uid = parseInt(localStorage.getItem('UserId') || '0', 10);
        if (uid > 0) {
            this.manageUsersService.refreshSentMailsCount();
        } else {
            this.startPollUntilUserId();
        }

        this.storageListener = (_e: StorageEvent) => {
            this.manageUsersService.refreshSentMailsCount();
        };
        window.addEventListener('storage', this.storageListener);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    private readonly onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            this.manageUsersService.refreshSentMailsCount();
        }
    };

    private startPollUntilUserId(): void {
        if (this.pollTimer) return;
        this.pollTimer = setInterval(() => {
            this.pollAttempts++;
            const uid = parseInt(localStorage.getItem('UserId') || '0', 10);
            if (uid > 0) {
                this.manageUsersService.refreshSentMailsCount();
                this.stopPoll();
                return;
            }
            if (this.pollAttempts >= this.MAX_POLL_ATTEMPTS) {
                this.stopPoll();
            }
        }, 500);
    }

    private stopPoll(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    ngAfterViewInit() {
        setTimeout(() => { this.settings.loadingSpinner = false }, 300);
        this.backToTop.nativeElement.style.display = 'none';
        this.routerSub = this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(() => {
                this.manageUsersService.refreshSentMailsCount();
                if (!this.settings.sidenavIsPinned && this.sidenav) {
                    this.sidenav.close();
                }
                if (window.innerWidth <= 768 && this.sidenav) {
                    this.sidenav.close();
                }
            });
        if (this.settings.menu == "vertical") {
            let isSupplier = false;
            const token = sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    const uType = decoded.UserType || decoded.userType;
                    if (uType === 'Supplier') {
                        isSupplier = true;
                    }
                } catch (e) {}
            } else {
                isSupplier = this.router.url.startsWith('/app/supplier-login');
            }

            const verticalItems = isSupplier
                ? this.menuService.getSupplierMenuItems()
                : this.menuService.getVerticalMenuItems();
            this.menuService.expandActiveSubMenu(verticalItems);
        }
    }

    ngOnDestroy(): void {
        this.stopPoll();
        this.countSub?.unsubscribe();
        this.routerSub?.unsubscribe();
        if (this.storageListener) {
            window.removeEventListener('storage', this.storageListener);
        }
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
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

    public forceRefreshCount() {
        // Manually trigger the service to fetch the latest count from the DB
        // this.manageUsersService.refreshSentMailsCount();
        this.manageUsersService.refreshSentMailsCount(undefined, undefined, true);
    }
}
