import {Injectable} from '@angular/core';
import {BackgroundMode} from '@awesome-cordova-plugins/background-mode/ngx';
import {Observable, Subscription, timer} from 'rxjs';
import {App} from '@capacitor/app';
import {NfcService} from '@app/services/nfc.service';

@Injectable({
    providedIn: 'root'
})
export class BackgroundService {

    public constructor(private backgroundMode: BackgroundMode) {
    }

    public enableBackgroundMode(): void {
        this.backgroundMode.enable();
    }

    public disableBackgroundMode(): void {
        this.backgroundMode.disable();
    }

    public isAppInBackground(): boolean {
        return this.backgroundMode.isActive();
    }

    public getBackgroundModeExited$(): Observable<any> {
        return this.backgroundMode.on('deactivate');
    }

    /**
     * Force the application to go into background mode after delay second
     *
     * @param delay the delay in millisecond before the app goes to the background
     */
    public activateBackgroundMode(delay?: number): void {
        if (!delay) {
            delay = 100;
        }
        timer(delay).subscribe(() => this.backgroundMode.moveToBackground());
    }
}
