import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {SettingsMenuPage} from '@app/pages/settings-menu/settings-menu.page';
import {Subscription} from 'rxjs';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.page.html',
    styleUrls: ['./global-settings.page.scss'],
})
export class GlobalSettingsPage implements OnInit, ViewWillEnter,ViewWillLeave {

    public currentHeaderMode: HeaderMode;

    private screenOrientationSubscription: Subscription;

    constructor(private screenOrientationService: ScreenOrientationService,
                private ngZone: NgZone,
                private _settingMenuPage: SettingsMenuPage) {
    }

    ionViewWillEnter() {
        this.updateCurrentHeaderMod();
        this.screenOrientationSubscription =  this.screenOrientationService.getOrientationChangeObservable().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updateCurrentHeaderMod();
                });
            }
        );
    }

    ionViewWillLeave() {
        this.screenOrientationSubscription.unsubscribe();
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
