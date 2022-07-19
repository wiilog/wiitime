import {Component, OnInit} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.page.html',
    styleUrls: ['./global-settings.page.scss'],
})
export class GlobalSettingsPage implements OnInit {

    public headerModeTab: HeaderMode = HeaderMode.PARAMETER_TAB;
    public headerModeFull: HeaderMode = HeaderMode.PARAMETER_TAB;
    public isFullMode: boolean;

    constructor(private screenOrientation: ScreenOrientation) {
        this.updateHeaderMod();
        this.screenOrientation.onChange().subscribe(
            () => {
                this.updateHeaderMod();
            }
        );
    }

    public updateHeaderMod(): void {
        this.isFullMode = (this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_SECONDARY
            || this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
    }

    ngOnInit() {
    }

}
