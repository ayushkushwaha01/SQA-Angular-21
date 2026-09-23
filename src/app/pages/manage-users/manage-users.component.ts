import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';

@Component({
  selector: 'app-master-users',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class MasterUsersComponent implements OnInit {

  activeTab = 'users';

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateActiveTab(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveTab(event.urlAfterRedirects || event.url);
      });
  }

  private updateActiveTab(url: string) {
    if (url.includes('roles')) {
      this.activeTab = 'roles';
    } else if (url.includes('supplier')) {
      this.activeTab = 'suppliers';
    } else {
      this.activeTab = 'users';
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }
}
