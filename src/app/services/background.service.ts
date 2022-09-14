import {Injectable} from '@angular/core';
import {BackgroundMode} from '@awesome-cordova-plugins/background-mode/ngx';
import {Observable, Subscription, timer} from 'rxjs';
import {App} from '@capacitor/app';
import {NfcService} from '@app/services/nfc.service';

@Injectable({
    providedIn: 'root'
})
export class BackgroundService {

    private sub: Subscription;

    public constructor(private backgroundMode: BackgroundMode, private nfc: NfcService) {
        this.backgroundMode.on('enable').subscribe(() => console.log('enable'));
        this.backgroundMode.on('disable').subscribe(() => console.log('disable'));
        this.backgroundMode.on('activate').subscribe(() => console.log('activate'));
        this.backgroundMode.on('deactivate').subscribe(() => console.log('deactivate'));
        App.addListener('appStateChange', (appState) => {
            console.log('App is active ->', appState.isActive);
        });
    }

    public enableBackgroundMode() {
        this.backgroundMode.enable();
    }

    public disableBackgroundMode() {
        this.backgroundMode.disable();
    }

    public isAppInBackground() {
        return this.backgroundMode.isActive();
    }

    public getBackgroundModeExited$(): Observable<any> {
        return this.backgroundMode.on('deactivate');
    }

    public wakeScreen() {
        this.backgroundMode.wakeUp();
    }

    public unlockScreen() {
        this.backgroundMode.unlock();
    }

    public activateBackgroundMode() {
        this.backgroundMode.moveToBackground();
    }

    public moveToForeground() {
        if (this.isAppInBackground()) {
            this.backgroundMode.moveToForeground();
        }
    }
}
