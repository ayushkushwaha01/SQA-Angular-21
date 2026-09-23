import { Component, inject, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Settings, SettingsService } from './services/settings.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  settingsService = inject(SettingsService);
  router = inject(Router);
  settings: Settings = this.settingsService.settings;

  constructor() {
    this.settings.loadingSpinner = false;
    Highcharts.setOptions({
      plotOptions: {
        pie: {
          borderWidth: 0,
          borderColor: '#ffffff'
        },
        column: {
          borderWidth: 0,
          borderColor: 'transparent'
        },
        bar: {
          borderWidth: 0,
          borderColor: 'transparent'
        },
        series: {
          borderWidth: 0,
          borderColor: 'transparent'
        }
      }
    });
  }

  ngAfterViewInit() {
    this.settings.loadingSpinner = false;
  }
}