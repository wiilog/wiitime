import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {SettingsMenuPage} from '@app/pages/settings-menu/settings-menu.page';

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.page.html',
    styleUrls: ['./global-settings.page.scss'],
})
export class GlobalSettingsPage implements OnInit {

    public currentHeaderMode: HeaderMode;

    constructor(private screenOrientation: ScreenOrientation,
                private screenOrientationService: ScreenOrientationService,
                private ngZone: NgZone,
                private _settingMenuPage: SettingsMenuPage) {
        this.updateCurrentHeaderMod();
        this.screenOrientation.onChange().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updateCurrentHeaderMod();
                });
            }
        );
    }

    public backButtonAction() {
        this._settingMenuPage.menu.open();
    }

    public updateCurrentHeaderMod(): void {
        this.currentHeaderMode = (this.screenOrientationService.isPortraitMode())
            ? HeaderMode.PARAMETER_FULL: HeaderMode.PARAMETER_TAB;
    }

    ngOnInit() {
    }
}
