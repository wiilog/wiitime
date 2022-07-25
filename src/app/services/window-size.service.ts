import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WindowSizeService {

    public constructor(private platform: Platform,
                       private screenOrientationService: ScreenOrientationService) {
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
        return (this.screenOrientationService.isPortraitMode()) ? this.platform.width() : this.platform.height();
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
        return (this.screenOrientationService.isPortraitMode()) ? this.platform.height() : this.platform.width();
    }
}
