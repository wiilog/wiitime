import {Component, ElementRef, EventEmitter, NgZone, OnInit, ViewChild} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {SettingsMenuPage} from '@app/pages/settings-menu/settings-menu.page';
import {Subject, Subscription, zip} from 'rxjs';
import {Platform, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {environment} from '../../../environments/environment';
import {WindowSizeService} from '@app/services/window-size.service';
import {TabConfig} from '@app/components/tab/tab-config';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {mergeMap, tap} from 'rxjs/operators';
import {FormSize} from '@app/components/form/form-size-enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingService} from "@app/services/loading.service";

enum SecondaryMode {
    KIOSK = 1,
    BACKGROUND = 2,
}

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.page.html',
    styleUrls: ['./global-settings.page.scss'],
})
export class GlobalSettingsPage implements ViewWillEnter, ViewWillLeave, OnInit {

    @ViewChild('inputImage', {read: ElementRef})
    public inputImage: ElementRef;

    public isPortraitMode: boolean;
    public hideFormButton: boolean;
    public currentHeaderMode: HeaderMode;
    public refreshHeader$: Subject<string>;

    public globalSettingsForm: FormGroup;
    public isSubmitted = false;

    //Logo selection field
    public readonly logoSelectionFieldName = 'Logo*';
    public logoSelectionFieldLogo: string;

    //Admin account setting
    public adminUsername: string;
    public adminPassword: string;

    //update user info field
    public readonly updateUserInfoFieldName = 'Identifiant & Mot de passe*';

    //Kiosk message field settings
    public readonly kioskMessageFormControlName = 'kioskMessage';
    public readonly kioskMessageFieldName = 'Message accueil Kiosque';
    public readonly kioskMessageFieldMaxLength = 25;
    public readonly kioskMessageFieldSize: FormSize = FormSize.MEDIUM;

    //Kiosk communication field settings
    public readonly kioskCommunicationFormControlName = 'kioskCommunication';
    public readonly kioskCommunicationFieldName = 'Message communication';
    public readonly kioskCommunicationFieldMaxLength = 150;
    public readonly kioskCommunicationFieldSize: FormSize = FormSize.LARGE;

    //Secondary mode toggle field settings
    public readonly secondaryModeToggleFieldName = 'Mode*';
    public currentToggleOption: SecondaryMode;
    public readonly tabConfig: TabConfig[] = [
        {label: 'Kiosque', key: SecondaryMode.KIOSK},
        {label: 'Background', key: SecondaryMode.BACKGROUND},
    ];

    //volume range field settings
    public readonly volumeRangeFieldName = 'Volume bip';
    public readonly volumeRangeFieldFormControlName = 'clockingVolume';

    private windowSizeSubscription: Subscription;
    private keyboardShowSubscription: Subscription;
    private keyboardHideSubscription: Subscription;
    private valueSetterSubscription: Subscription;
    private saveSubscription: Subscription;

    public constructor(private screenOrientationService: ScreenOrientationService,
                       private windowSizeService: WindowSizeService,
                       private storageService: StorageService,
                       private loadingService: LoadingService,
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
            clockingVolume: ['', []],
        });
    }

    public get errorControl() {
        return this.globalSettingsForm.controls;
    }

    public ngOnInit(): void {
        this.refreshHeader$ = new Subject<string>();
    }

    public ionViewWillEnter(): void {
        this.hideFormButton = false;

        this.updatePageAfterWindowSizeChanged();
        this.windowSizeSubscription = this.windowSizeService.getWindowResizedObservable().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updatePageAfterWindowSizeChanged();
                });
            }
        );

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

        //TODO delete this thing (used for test) -> storage init should not be done here
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
                this.storageService.getValue(StorageKeyEnum.LOGO),
                this.storageService.getValue(StorageKeyEnum.ADMIN_USERNAME),
                this.storageService.getValue(StorageKeyEnum.ADMIN_PASSWORD),
            )
                .subscribe(([message,
                                communication,
                                currentSecondaryMode,
                                clockingSoundVolume,
                                logo,
                                adminUsername,
                                adminPassword]) => {
                    if (!message) {
                        throw new Error('Kiosk mode message should not be null');
                    }
                    if (!communication) {
                        throw new Error('Kiosk mode communication should not be null');
                    }
                    if (!currentSecondaryMode) {
                        throw new Error('current secondary mode should not be null');
                    }
                    if (!clockingSoundVolume) {
                        throw new Error('clocking sound volume should not be null');
                    }
                    if (!logo) {
                        throw new Error('logo should not be null');
                    }
                    if (!adminUsername) {
                        //throw new Error('admin username should not be null'); Todo uncomment for test
                    }
                    if (!adminPassword) {
                        //throw new Error('admin password should not be null'); Todo uncomment for test
                    }
                    this.globalSettingsForm.controls.kioskMessage.setValue(message);
                    this.globalSettingsForm.controls.kioskCommunication.setValue(communication);
                    this.currentToggleOption = (Number(currentSecondaryMode) === 0) ? SecondaryMode.KIOSK : SecondaryMode.BACKGROUND;
                    this.globalSettingsForm.controls.clockingVolume.setValue(Number(clockingSoundVolume));
                    this.logoSelectionFieldLogo = logo;
                    this.adminUsername = adminUsername;
                    this.adminPassword = adminPassword;
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

        if (this.saveSubscription && !this.saveSubscription.closed) {
            this.saveSubscription.unsubscribe();
        }
    }

    public formSubmitted(): void {
        this.isSubmitted = true;
        if (!this.globalSettingsForm.valid) {
            console.log('Invalid form content !');
            return;
        }
        this.saveSubscription = this.loadingService.presentLoadingWhile({
            message: 'sauvegarde en cours...',
            event: () => zip(this.storageService.setValue(StorageKeyEnum.LOGO, this.logoSelectionFieldLogo),
                this.storageService.setValue(StorageKeyEnum.ADMIN_USERNAME, this.adminUsername),
                this.storageService.setValue(StorageKeyEnum.ADMIN_PASSWORD, this.adminPassword),
                this.storageService.setValue(StorageKeyEnum.KIOSK_MODE_MESSAGE, this.globalSettingsForm.value.kioskMessage),
                this.storageService.setValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION, this.globalSettingsForm.value.kioskCommunication),
                this.storageService.setValue(StorageKeyEnum.CURRENT_SECONDARY_MODE,
                    this.currentToggleOption === SecondaryMode.KIOSK ? '0' : '1'),
                this.storageService.setValue(StorageKeyEnum.CLOCKING_SOUND_VOLUME, this.globalSettingsForm.value.clockingVolume),
            )
        })
            .subscribe(() => {
                this.refreshHeader$.next(this.logoSelectionFieldLogo);
                console.log('save done');
                //Todo spawn a cool toast
            });
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

    public updateLogoButtonClicked(): void {
        //trigger input image OnClick event to open the file browser
        this.inputImage.nativeElement.click();
    }

    public updateAdminInfoButtonClicked(): void {
        //Todo connect update admin settings modal
    }

    public updateLogo(result: any) {
        if (result.target.files.length > 0) {
            console.log(result);
            console.log(result.target.value);
            const reader = new FileReader();
            reader.readAsDataURL(result.target.files[0]);
            reader.onload = () => {
                console.log(reader.result);
                this.logoSelectionFieldLogo = reader.result.toString();
            };
        }
    }
}
