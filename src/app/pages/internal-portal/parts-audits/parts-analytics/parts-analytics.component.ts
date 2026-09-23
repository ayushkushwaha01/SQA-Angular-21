import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';

@Component({
  standalone: false,
  selector: 'app-parts-analytics',
  templateUrl: './parts-analytics.component.html',
  styleUrls: ['./parts-analytics.component.scss']
})
export class PartsAnalyticsComponent implements OnInit {

  // ✅ Inject ChangeDetectorRef
  constructor(private cdr: ChangeDetectorRef) { }

  canRead: boolean = false;
  readonly SCREEN_ID: number = 18; // Screen ID for Process Analytics

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);

    // 🔥 If they can't read, stop loading charts/API calls
    if (!this.canRead) return;

  }

  // ✅ Add this function! 
  // This simulates the "extra clicks" by forcing Angular to update the UI
  // right after the heavy Highcharts math finishes freezing the thread.
  forceUpdate(): void {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  }

}