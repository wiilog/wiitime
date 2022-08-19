import {
    AfterViewInit,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {zip} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {FormSize} from '@app/components/form/form-size-enum';
import {TabConfig} from '@app/components/tab/tab-config';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {WindowSizeService} from '@app/services/window-size.service';
import {StorageService} from '@app/services/storage/storage.service';
import {LoadingService} from '@app/services/loading.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SettingsMenuComponent} from '@app/components/settings-menu/settings-menu.component';
import {ModalController} from '@ionic/angular';
import {FormModalComponent} from '@app/modals/form-modal/form-modal.component';

enum SecondaryMode {
    KIOSK = 1,
    BACKGROUND = 2,
}

@Component({
    selector: 'app-global-settings',
    templateUrl: './global-settings.component.html',
    styleUrls: ['./global-settings.component.scss'],
})
export class GlobalSettingsComponent extends SettingsMenuComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('inputImage', {read: ElementRef})
    public inputImage: ElementRef;

    //Logo selection field settings
    public readonly logoSelectionFieldName = 'Logo*';
    public logoSelectionFieldLogo: string;

    //Admin account setting
    public adminUsername: string;
    public adminPassword: string;

    //update user info field settings
    public readonly updateUserInfoFieldName = 'Identifiant & Mot de passe*';

    //Kiosk message field settings
    public readonly kioskMessageFormControlName = 'kioskMessage';
    public readonly kioskMessageFieldName = 'Message accueil Kiosque';
    public readonly kioskMessageMaxLength = 25;
    public readonly kioskMessageSize: FormSize = FormSize.MEDIUM;

    //Kiosk communication field settings
    public readonly kioskCommunicationFormControlName = 'kioskCommunication';
    public readonly kioskCommunicationFieldName = 'Message communication';
    public readonly kioskCommunicationMaxLength = 150;
    public readonly kioskCommunicationSize: FormSize = FormSize.LARGE;

    //Secondary mode toggle field settings
    public readonly secondaryModeToggleName = 'Mode*';
    public currentToggleOption: SecondaryMode;
    public readonly tabConfig: TabConfig[] = [
        {label: 'Kiosque', key: SecondaryMode.KIOSK},
        {label: 'Background', key: SecondaryMode.BACKGROUND},
    ];

    //volume range field settings
    public readonly volumeRangeFormControlName = 'clockingVolume';
    public readonly volumeRangeFieldName = 'Volume bip';

    public constructor(protected screenOrientationService: ScreenOrientationService,
                       protected windowSizeService: WindowSizeService,
                       private storageService: StorageService,
                       private loadingService: LoadingService,
                       private formBuilder: FormBuilder,
                       private modalCtrl: ModalController,
                       protected ngZone: NgZone) {
        super(screenOrientationService, windowSizeService, ngZone);
        this.form = this.formBuilder.group({
            kioskMessage: ['', [Validators.maxLength(this.kioskMessageMaxLength)
            ]],
            kioskCommunication: ['', [Validators.maxLength(this.kioskCommunicationMaxLength)
            ]],
            clockingVolume: ['', []],
        });
    }

    public ngOnInit(): void {
        this.initSettingsMenu();
    }

    public ngAfterViewInit(): void {
        this.initSubmitFormSubscription();
    }

    public ngOnDestroy(): void {
        this.clearSubscriptionOnDestroy();
    }

    public updateLogoButtonClicked(): void {
        //trigger input image OnClick event to open the file browser
        this.inputImage.nativeElement.click();
    }

    public async updateAdminInfoButtonClicked(): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: FormModalComponent,
            keyboardClose: true,
            componentProps: {
                modalTitle: 'Modifier l\'identifiant et le mot de passe',
                adminUsername: this.adminUsername,
                adminPassword: this.adminPassword,
            },
            cssClass: 'auto-height',
            backdropDismiss: false,
        });
        await modal.present();

        const {data, role} = await modal.onWillDismiss();
        if (role === 'confirm') {
            console.log(data);
            this.adminUsername = data.username;
            this.adminPassword = data.password;
            console.log(this.adminUsername, ' ', this.adminPassword);
        }
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

    protected initContent(): void {
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
                    this.form.controls.kioskMessage.setValue(message);
                    this.form.controls.kioskCommunication.setValue(communication);
                    this.currentToggleOption = (Number(currentSecondaryMode) === 0) ? SecondaryMode.KIOSK : SecondaryMode.BACKGROUND;
                    this.form.controls.clockingVolume.setValue(Number(clockingSoundVolume));
                    this.logoSelectionFieldLogo = logo;
                    this.adminUsername = adminUsername;
                    this.adminPassword = adminPassword;
                });
        });
    }

    protected formSubmitted(): void {
        this.isSubmitted = true;
        if (!this.form.valid) {
            console.log('Invalid form content !');
            return;
        }
        this.saveSubscription = this.loadingService.presentLoadingWhile({
            message: 'sauvegarde en cours...',
            event: () => zip(this.storageService.setValue(StorageKeyEnum.LOGO, this.logoSelectionFieldLogo),
                this.storageService.setValue(StorageKeyEnum.ADMIN_USERNAME, this.adminUsername),
                this.storageService.setValue(StorageKeyEnum.ADMIN_PASSWORD, this.adminPassword),
                this.storageService.setValue(StorageKeyEnum.KIOSK_MODE_MESSAGE, this.form.value.kioskMessage),
                this.storageService.setValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION, this.form.value.kioskCommunication),
                this.storageService.setValue(StorageKeyEnum.CURRENT_SECONDARY_MODE,
                    this.currentToggleOption === SecondaryMode.KIOSK ? '0' : '1'),
                this.storageService.setValue(StorageKeyEnum.CLOCKING_SOUND_VOLUME, this.form.value.clockingVolume.toString()),
            )
        })
            .subscribe(() => {
                this.isSubmitted = false;
                this.validFormSubmittedEvent.emit(this.logoSelectionFieldLogo);
            });
    }
}
