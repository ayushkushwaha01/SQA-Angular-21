import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Shows a toast notification.
   * @param message The message to display.
   * @param type 1 for success/info, 0 for error/warning.
   */
  createAlert(message: string, type: number = 1): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  warn(message: string): void {
    this.createAlert(message, 0);
  }

  success(message: string): void {
    this.createAlert(message, 1);
  }

}
