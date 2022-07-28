import {Component, NgZone, OnInit} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {SettingsMenuPage} from '@app/pages/settings-menu/settings-menu.page';
import {Subscription, zip} from 'rxjs';
import {Platform, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {environment} from '../../../environments/environment';
import {WindowSizeService} from '@app/services/window-size.service';
import {TabConfig} from '@app/components/tab/tab-config';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {mergeMap} from 'rxjs/operators';
import {FormSize} from '@app/components/form/form-size-enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

enum SecondaryMode {
    KIOSK = 1,
    BACKGROUND = 2,
}

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.page.html',
    styleUrls: ['./global-settings.page.scss'],
})
export class GlobalSettingsPage implements ViewWillEnter, ViewWillLeave {

    public isPortraitMode: boolean;
    public hideFormButton: boolean;
    public currentHeaderMode: HeaderMode;

    public globalSettingsForm: FormGroup;
    public isSubmitted = false;

    //Logo selection field
    public readonly logoSelectionFieldName = 'Logo*';
    public readonly logoSelectionFieldLogo = '/assets/img/LogoGT.png'; //TODO replace with value from storage

    //update user info field
    public readonly updateUserInfoFieldName = 'Identifiant & Mot de passe*';

    //Kiosk message field settings
    public readonly kioskMessageFormControlName = 'kioskMessage';
    public readonly kioskMessageFieldName = 'Message accueil Kiosque';
    public readonly kioskMessageFieldMaxLength = 25;
    public readonly kioskMessageFieldSize: FormSize = FormSize.MEDIUM;
    public kioskMessageDefaultValue;

    //Kiosk communication field settings
    public readonly kioskCommunicationFormControlName = 'kioskCommunication';
    public readonly kioskCommunicationFieldName = 'Message communication';
    public readonly kioskCommunicationFieldMaxLength = 150;
    public readonly kioskCommunicationFieldSize: FormSize = FormSize.LARGE;
    public kioskCommunicationDefaultValue;

    //Secondary mode toggle field settings
    public readonly secondaryModeToggleFieldName = 'Mode*';
    public currentToggleOption: SecondaryMode;
    public readonly tabConfig: TabConfig[] = [
        {label: 'Kiosque', key: SecondaryMode.KIOSK},
        {label: 'Background', key: SecondaryMode.BACKGROUND},
    ];

    //volume range field settings
    public readonly volumeRangeFieldName = 'Volume bip';
    public volumeRangeFieldDefaultValue;

    private windowSizeSubscription: Subscription;
    private keyboardShowSubscription: Subscription;
    private keyboardHideSubscription: Subscription;
    private valueSetterSubscription: Subscription;

    public constructor(private screenOrientationService: ScreenOrientationService,
                private windowSizeService: WindowSizeService,
                private storageService: StorageService,
                private _settingMenuPage: SettingsMenuPage,
                private formBuilder: FormBuilder,
                private ngZone: NgZone,
                private platform: Platform) {
        this.globalSettingsForm = this.formBuilder.group({
            kioskMessage: ['', [Validators.required,
                Validators.maxLength(this.kioskMessageFieldMaxLength)
            ]],
            kioskCommunication: ['', [Validators.required,
                Validators.maxLength(this.kioskCommunicationFieldMaxLength)
            ]],
        });
    }

    public get errorControl() {
        return this.globalSettingsForm.controls;
    }

    public ionViewWillEnter(): void {
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

        //TODO delete this thing -> storage init should not be done here
        this.ngZone.run(() => {
            this.storageService.initStorage().pipe(
                mergeMap(() => this.storageService.getValue(StorageKeyEnum.CURRENT_SECONDARY_MODE)),
            ).subscribe((result: string | null) => {
                console.log('good');
                //this.currentToggleOption = Number(result as unknown as SecondaryMode) || SecondaryMode.KIOSK;
            });
        });

        this.ngZone.run(() => {
            this.valueSetterSubscription = zip(this.storageService.getValue(StorageKeyEnum.KIOSK_MODE_MESSAGE),
                this.storageService.getValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION),
                this.storageService.getValue(StorageKeyEnum.CURRENT_SECONDARY_MODE),
                this.storageService.getValue(StorageKeyEnum.CLOCKING_SOUND_VOLUME),
            )
                .subscribe(([message,
                                    communication,
                                    currentSecondaryMode,
                                    clockingSoundVolume]) => {
                    if (!message) {
                        throw new Error('Kiosk mode message should not be null');
                    }
                    if (!communication) {
                        throw new Error('Kiosk mode communication should not be null');
                    }
                    if (!currentSecondaryMode) {
                        throw new Error('current secondary mode should not be null');
                    }
                    if(!clockingSoundVolume) {
                        throw new Error('clocking sound volume should not be null');
                    }
                    this.kioskMessageDefaultValue = message;
                    this.kioskCommunicationDefaultValue = communication;
                    this.currentToggleOption = (Number(currentSecondaryMode) === 0) ? SecondaryMode.KIOSK : SecondaryMode.BACKGROUND;
                    this.volumeRangeFieldDefaultValue = Number(clockingSoundVolume);
                });
        });

    }

    public ionViewWillLeave(): void {
        this.windowSizeSubscription.unsubscribe();
        this.keyboardShowSubscription.unsubscribe();
        this.keyboardHideSubscription.unsubscribe();

        if (this.valueSetterSubscription && !this.valueSetterSubscription.closed) {
            this.valueSetterSubscription.unsubscribe();
        }
    }

    public formSubmitted(): void {
        this.isSubmitted = true;
        if (!this.globalSettingsForm.valid) {
            console.log(this.globalSettingsForm.value.kioskMessage); //this.globalSettingsForm.controls.kioskMessage.errors
            this.globalSettingsForm.controls.kioskMessage.setValue('hihi');
        }
        // TODO save new value and then update view
        /*
        zip(this.storageService.setValue(StorageKeyEnum.ADMIN_USERNAME, this.accountForm.value.username),
            this.storageService.setValue(StorageKeyEnum.ADMIN_PASSWORD, this.accountForm.value.password))
            .subscribe(() => this.navService.setRoot(PagePath.HOME));
        console.log('submit');
        */
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
}
