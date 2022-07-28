import {Component, NgZone, OnInit} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {SettingsMenuPage} from '@app/pages/settings-menu/settings-menu.page';
import {Subscription} from 'rxjs';
import {Platform, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {environment} from '../../../environments/environment';
import {WindowSizeService} from '@app/services/window-size.service';
import {TabConfig} from '@app/components/tab/tab-config';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {mergeMap} from 'rxjs/operators';
import {FormSize} from '@app/components/form/form-size-enum';

enum SecondaryMode {
    KIOSQUE = 1,
    BACKGROUND = 2,
}

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.page.html',
    styleUrls: ['./global-settings.page.scss'],
})
export class GlobalSettingsPage implements OnInit, ViewWillEnter, ViewWillLeave {

    public isPortraitMode: boolean;
    public hideFormButton: boolean;
    public currentHeaderMode: HeaderMode;

    //Logo selection field
    public readonly logoSelectionFieldName = 'Logo*';
    public readonly logoSelectionFieldLogo = '/assets/img/LogoGT.png'; //TODO replace with value from storage

    //update user info field
    public readonly updateUserInfoFieldName = 'Identifiant & Mot de passe*';

    //Kiosk message field settings
    public readonly kioskMessageFieldName = 'Message accueil Kiosque';
    public readonly kioskMessageFieldMaxLength = 25;
    public readonly kioskMessageFieldSize: FormSize = FormSize.MEDIUM;

    //Kiosk communication field settings
    public readonly communicationMessageFieldName = 'Message communication';
    public readonly communicationMessageFieldMaxLength = 150;
    public readonly communicationMessageFieldSize: FormSize = FormSize.LARGE;

    //Secondary mode toggle field settings
    public readonly secondaryModeToggleFieldName = 'Mode*';
    public currentToggleOption: SecondaryMode = SecondaryMode.KIOSQUE;
    public readonly tabConfig: TabConfig[] = [
        {label: 'Kiosque', key: SecondaryMode.KIOSQUE},
        {label: 'Background', key: SecondaryMode.BACKGROUND},
    ];

    //volume range field settings
    public readonly volumeRangeFieldName = 'Volume bip';

    private windowSizeSubscription: Subscription;
    private keyboardShowSubscription: Subscription;
    private keyboardHideSubscription: Subscription;

    constructor(private screenOrientationService: ScreenOrientationService,
                private windowSizeService: WindowSizeService,
                private storageService: StorageService,
                private _settingMenuPage: SettingsMenuPage,
                private ngZone: NgZone,
                private platform: Platform) {
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

        this.hideFormButton = false;
        this.keyboardShowSubscription = this.platform.keyboardDidShow.subscribe(() => {
            this.ngZone.run(() => {
                this.hideFormButton = true;
            });
        });

        this.keyboardHideSubscription = this.platform.keyboardDidHide.subscribe(() => {
            this.ngZone.run(() => {
                this.hideFormButton = false;
            });
        });

        this.ngZone.run(() => {
            this.storageService.initStorage().pipe(
                mergeMap(() => this.storageService.getValue(StorageKeyEnum.CURRENT_SECONDARY_MODE)),
            ).subscribe((result: string | null) => {
                this.currentToggleOption = Number(result as unknown as SecondaryMode) || SecondaryMode.KIOSQUE;
            });
        });
    }

    ionViewWillLeave() {
        this.windowSizeSubscription.unsubscribe();
    }

    ngOnInit() {
    }

    public formSubmitted(): void {
        console.log('submit');
    }

    public backButtonAction() {
        this._settingMenuPage.menu.open();
    }

    public updatePageAfterWindowSizeChanged(): void {
        this.isPortraitMode = this.screenOrientationService.isPortraitMode();
        if (this.windowSizeService.getWindowWidth() < environment.minWindowWidthForSideMenu || this.isPortraitMode) {
            this.currentHeaderMode = HeaderMode.PARAMETER_FULL;
        } else {
            this.currentHeaderMode = HeaderMode.PARAMETER_TAB;
        }
    }

    public test1(): void {
        console.log('clicked');
    }
}
