import {Component, NgZone, OnInit} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {SettingsMenuPage} from '@app/pages/settings-menu/settings-menu.page';
import {Subscription} from 'rxjs';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {environment} from '../../../environments/environment';
import {WindowSizeService} from '@app/services/window-size.service';

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.page.html',
    styleUrls: ['./global-settings.page.scss'],
})
export class GlobalSettingsPage implements OnInit, ViewWillEnter,ViewWillLeave {

    public currentHeaderMode: HeaderMode;

    public isPortraitMode: boolean;

    private windowSizeSubscription: Subscription;

    constructor(private screenOrientationService: ScreenOrientationService,
                private windowSizeService: WindowSizeService,
                private ngZone: NgZone,
                private _settingMenuPage: SettingsMenuPage) {
    }

    ionViewWillEnter() {
        this.updatePageAfterWindowSizeChanged();
        this.windowSizeSubscription = this.windowSizeService.getWindowResizedObservable().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updatePageAfterWindowSizeChanged();
                });
            }
        );
    }

    ionViewWillLeave() {
        this.windowSizeSubscription.unsubscribe();
    }

    ngOnInit() {
    }

    public backButtonAction() {
        this._settingMenuPage.menu.open();
    }

    public updatePageAfterWindowSizeChanged(): void {
        this.isPortraitMode = this.screenOrientationService.isPortraitMode();
        if(this.windowSizeService.getWindowWidth() < environment.minWindowWidthForSideMenu || this.isPortraitMode) {
            this.currentHeaderMode = HeaderMode.PARAMETER_FULL;
        } else {
            this.currentHeaderMode = HeaderMode.PARAMETER_TAB;
        }
    }

    public test1(): void {
        console.log('clicked');
    }
}
