import { Component } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, UrlSegment, NavigationEnd, RouterModule } from "@angular/router"; 
import { Title } from '@angular/platform-browser';
import { Settings, SettingsService } from '../../../services/settings.service';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-breadcrumb',
    imports: [
        CommonModule,
        FlexLayoutModule,
        RouterModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {

    public pageTitle: string = '';
    public description: string = '';
    public breadcrumbs: {
        name: string;
        url: string;
    }[] = [];

    public settings: Settings;

    constructor(
        public settingsService: SettingsService,
        public router: Router, 
        public activatedRoute: ActivatedRoute,                
        public title: Title
    ) {
        this.settings = this.settingsService.settings; 
        
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.breadcrumbs = [];                
                this.description = '';
                this.parseRoute(this.router.routerState.snapshot.root); 
                
                if (this.breadcrumbs.length > 0) {
                    this.pageTitle = this.breadcrumbs[this.breadcrumbs.length - 1].name;
                } else {
                    this.pageTitle = '';
                }

                let fullTitle = "";
                this.breadcrumbs.forEach(breadcrumb => {
                    fullTitle += ' > ' + breadcrumb.name;
                });       
                this.title.setTitle(this.settings.name + fullTitle);
            }
        });   
    }

    private parseRoute(node: ActivatedRouteSnapshot) { 
        if (node.data && node.data['breadcrumb']) {
            if (node.url.length) {
                let urlSegments: UrlSegment[] = [];
                node.pathFromRoot.forEach(routerState => {
                    urlSegments = urlSegments.concat(routerState.url);
                });
                let url = urlSegments.map(urlSegment => {
                    return urlSegment.path;
                }).join('/');

                if (!this.breadcrumbs.some(b => b.name === node.data['breadcrumb'])) {
                    this.breadcrumbs.push({
                        name: node.data['breadcrumb'],
                        url: '/' + url
                    });
                }
            }         
        }

        if (node.data && node.data['description']) {
            this.description = node.data['description'];
        }

        if (node.firstChild) {
            this.parseRoute(node.firstChild);
        }
    }

    public closeSubMenus(){
        let menu = document.querySelector(".sidenav-menu-outer");
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
