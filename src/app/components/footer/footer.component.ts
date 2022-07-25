import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {App} from '@capacitor/app';
import {NavService} from '@app/services/nav/nav.service';
import {PagePath} from '@app/services/nav/page-path.enum';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {WindowSizeService} from "@app/services/window-size.service";
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {

    @Input()
    public footerMode: FooterMode;

    public footerModeEnum = FooterMode;

    public displayBorder: boolean;

    public currentVersionNumber: string; //TODO get value from storage instead

    private widowSizeSubscription: Subscription;

    constructor(private navService: NavService,
                private storage: StorageService,
                private screenOrientationService: ScreenOrientationService,
                private windowSizeService: WindowSizeService,
                private ngZone: NgZone) {
        this.currentVersionNumber = '0.0.42';
    }

    ngOnInit() {
        this.updateFooterModeAfterWindowSizeChanged();
        this.widowSizeSubscription = this.windowSizeService.getWindowResizedObservable()
            .subscribe(() => {
                this.ngZone.run(() => {
                    this.updateFooterModeAfterWindowSizeChanged();
                });
            });
    }

    ngOnDestroy() {
        this.widowSizeSubscription.unsubscribe();
    }

    public updateFooterModeAfterWindowSizeChanged() {
        this.displayBorder = (!this.screenOrientationService.isPortraitMode())
            && this.windowSizeService.getWindowWidth() >= environment.minWindowWidthForSideMenu;
    }

    public quitApplicationButtonClicked() {
        //Todo save important data if any
        App.exitApp();
    }

    public changeModeButtonClicked() {
        //Todo connect to the kiosk or background mode depending on mode
        this.storage.getValue(StorageKeyEnum.IS_BACKGROUND_MODE_ACTIVE).subscribe((isActive) => {
            if (isActive != null) {
                const numberValue: number = parseInt(isActive.toString(), 10);
                if (numberValue) {
                    // Todo connect to background mode
                    this.navService.setRoot(PagePath.ACCOUNT_CREATION).subscribe(() => console.log('ho yes'));
                } else {
                    // Todo connect to kiosk mode
                    this.navService.setRoot(PagePath.ACCOUNT_CREATION).subscribe(() => console.log('ho yes'));
                }
            } else {
                console.error('Error storage value of key IS_BACKGROUND_MODE_ACTIVE is null -> should be 0 or 1');
            }
        });

    }

    public parametersButtonClicked() {
        //Todo maybe stuff to set up ?
        this.navService.push(PagePath.SETTINGS_MENU).subscribe(() => console.log('success'));
    }
}

