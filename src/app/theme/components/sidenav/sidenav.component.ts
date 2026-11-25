import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Settings, SettingsService } from '../../../services/settings.service';
import { MenuService } from '../../../services/menu.service';
import { VerticalMenuComponent } from '../menu/vertical-menu/vertical-menu.component';
import { Router, NavigationEnd } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-sidenav',
    imports: [
        FlexLayoutModule,
        NgScrollbarModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        VerticalMenuComponent
    ],
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SidenavComponent implements OnInit {
  public userImage = 'img/users/user.jpg';
  public menuItems: Array<any>;
  public settings: Settings;
  constructor(
      public settingsService: SettingsService,
      public menuService: MenuService,
      public router: Router
  ){
      this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.loadMenuItems();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadMenuItems();
      }
    });
  }

  private loadMenuItems() {
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

    this.menuItems = isSupplier
      ? this.menuService.getSupplierMenuItems()
      : this.menuService.getVerticalMenuItems();
  }

  public closeSubMenus(){
    let menu = document.getElementById("vertical-menu");
    if(menu){
      for (let i = 0; i < menu.children[0].children.length; i++) {
        let child = menu.children[0].children[i];
        if(child){
          if(child.children[0].classList.contains('expanded')){
              child.children[0].classList.remove('expanded');
              child.children[1].classList.remove('show');
          }
        }
      }
    }
  }

}
