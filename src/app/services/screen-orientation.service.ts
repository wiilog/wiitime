import {Injectable} from '@angular/core';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';

@Injectable({
    providedIn: 'root'
})
export class ScreenOrientationService {

    public constructor(private screenOrientation: ScreenOrientation) {
    }

    public isPortraitMode(): boolean {
        return this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY
        || this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_SECONDARY;
    }
}
