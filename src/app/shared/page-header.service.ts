import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PageHeaderService {
    private _backCallback: (() => void) | null = null;
    private _visible$ = new BehaviorSubject<boolean>(false);
    private _sidenavWidth$ = new BehaviorSubject<number>(0);

    readonly backBtnVisible$ = this._visible$.asObservable();
    readonly sidenavWidth$ = this._sidenavWidth$.asObservable();

    showBackButton(callback: () => void): void {
        this._backCallback = callback;
        this._visible$.next(true);
    }

    hideBackButton(): void {
        this._backCallback = null;
        this._visible$.next(false);
    }

    triggerBack(): void {
        if (this._backCallback) {
            this._backCallback();
        }
    }

    setSidenavWidth(width: number): void {
        this._sidenavWidth$.next(width);
    }
}
