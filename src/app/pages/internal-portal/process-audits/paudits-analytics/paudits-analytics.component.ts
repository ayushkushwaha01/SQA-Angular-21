import { Component, OnInit } from '@angular/core';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-paudits-analytics',
  templateUrl: './paudits-analytics.component.html',
  styleUrls: ['./paudits-analytics.component.scss']
})
export class PauditsAnalyticsComponent implements OnInit {

  canRead: boolean = false;
  readonly SCREEN_ID: number = 10; // Screen ID for Process Analytics


  constructor() { }

 ngOnInit(): void {
    // 🔥 Check permission first
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);

    // 🔥 If they can't read, stop loading charts/API calls
    if (!this.canRead) return;

    // ... (your existing code to load charts)
  }

}
