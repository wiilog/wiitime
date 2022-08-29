import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {Observable} from 'rxjs';
import {ScreenOrientation} from '@awesome-cordova-plugins/screen-orientation/ngx';

@Injectable({
    providedIn: 'root'
})
export class WindowService {

    public constructor(private platform: Platform,
                       private screenOrientation: ScreenOrientation) {
    }

    public isPortraitMode(): boolean {
        return this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY
            || this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_SECONDARY;
    }

    public getWindowResizedObservable(): Observable<void> {
        return this.platform.resize.asObservable();
    }

    /*
    * Return the current width of the window used to run the app.
    */
    public getWindowWidth(): number {
        return this.platform.width();
    }

    /*
     * Return the width of the window used to run the app when the device is in portrait mode.
     */
    public getWindowWidthOrientationFree(): number {
        return (this.isPortraitMode()) ? this.platform.width() : this.platform.height();
    }

    /*
     * Return the current height of the window used to run the app.
     */
    public getWindowHeight(): number {
        return this.platform.height();
    }

    /*
     * Return the height of the window used to run the app when the device is in portrait mode.
     */
    public getWindowHeightOrientationFree(): number {
        return (this.isPortraitMode()) ? this.platform.height() : this.platform.width();
    }
}
