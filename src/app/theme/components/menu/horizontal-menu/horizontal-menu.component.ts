import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router'; 
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuService } from '../../../../services/menu.service';
import { Settings, SettingsService } from '../../../../services/settings.service';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-horizontal-menu',
    standalone: true,
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './horizontal-menu.component.html',
    styleUrls: ['./horizontal-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HorizontalMenuComponent implements OnInit {
  @Input('menuParentId') menuParentId: any;
  public menuItems: Array<any>;
  public settings: Settings;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  constructor(public settingsService: SettingsService, public menuService: MenuService, public router:Router) { 
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.loadMenuItems();
  }

  private loadMenuItems() {
    const url = this.router.url;
    const allItems = url.startsWith('/app/supplier-login')
      ? this.menuService.getSupplierMenuItems()
      : this.menuService.getHorizontalMenuItems();
    this.menuItems = allItems.filter(item => item.parentId == this.menuParentId);
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadMenuItems();
        if (this.settings.fixedHeader) {
          const mainContent = document.getElementById('main-content');
          if (mainContent) { mainContent.scrollTop = 0; }
        } else {
          const drawer = document.getElementsByClassName('mat-drawer-content')[0] as HTMLElement;
          if (drawer) { drawer.scrollTop = 0; }
        }
      }
    });
  }

  public isItemActive(menu: any): boolean {
    if (!menu) return false;
    const currentUrl = this.router.url;
    if (menu.routerLink) {
      if (menu.routerLink === '/internal-portal/dashboard') {
        return currentUrl === '/internal-portal/dashboard' || currentUrl === '/internal-portal' || currentUrl === '/';
      }
      if (menu.routerLink === '/app/supplier-login/dashboard') {
        return currentUrl === '/app/supplier-login/dashboard' || currentUrl === '/app/supplier-login';
      }
      return currentUrl === menu.routerLink || currentUrl.startsWith(menu.routerLink + '/') || (menu.routerLink === '/manage-users' && currentUrl.startsWith('/manage-users'));
    }
    if (menu.id === 6 || menu.title === 'Admin') {
      return currentUrl.startsWith('/manage-users') || currentUrl.startsWith('/admin');
    }
    return false;
  }
}