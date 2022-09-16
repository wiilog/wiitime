import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription, zip} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {FormSize} from '@app/components/form/form-size-enum';
import {TabConfig} from '@app/components/tab/tab-config';
import {WindowService} from '@app/services/window.service';
import {StorageService} from '@app/services/storage/storage.service';
import {LoadingService} from '@app/services/loading.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SettingsMenuComponent} from '@app/components/settings-menu/settings-menu.component';
import {ModalController} from '@ionic/angular';
import {FormModalComponent} from '@app/modals/form-modal/form-modal.component';
import {AudioService} from '@app/services/audio/audio.service';
import {environment} from '../../../../environments/environment';
import {DropdownConfig} from '@app/components/form/form-dropdown/dropdown-config';
import {mergeMap} from 'rxjs/operators';

enum SecondaryMode {
    KIOSK = 0,
    BACKGROUND = 1,
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

    //clocking sound field settings
    public readonly clockingSoundDropdownFieldName = 'Choix du bip';
    public clockingSoundDropdownCurrentOption: DropdownConfig;
    public readonly clockingSoundDropdownConfig: DropdownConfig[] = [
        {elemName: 'bip 1', value: 'clockingSound.wav'},
        {elemName: 'bip 2', value: 'clockingSound2.wav'},
        {elemName: 'bip 3', value: 'clockingSound3.wav'},
        {elemName: 'bip 4', value: 'clockingSound4.wav'},
    ];

    //volume range field settings
    public readonly volumeRangeFormControlName = 'clockingVolume';
    public readonly volumeRangeFieldName = 'Volume bip';

    private isUpdateUserInfoModalOpen: boolean;
    private readonly clockingSoundId = environment.clockingSoundId;
    private loadAudioSubscription: Subscription;

    public constructor(protected windowService: WindowService,
                       private storageService: StorageService,
                       private loadingService: LoadingService,
                       private audioService: AudioService,
                       private formBuilder: FormBuilder,
                       private modalCtrl: ModalController,
                       protected ngZone: NgZone) {
        super(windowService, ngZone);
        this.form = this.formBuilder.group({
            kioskMessage: ['', [Validators.maxLength(this.kioskMessageMaxLength)]],
            kioskCommunication: ['', [Validators.maxLength(this.kioskCommunicationMaxLength)]],
            clockingVolume: ['', []],
        });
    }

    public ngOnInit(): void {
        this.initSettingsMenu();
        this.isUpdateUserInfoModalOpen = false;
        this.loadAudioSubscription = this.storageService.getValue(StorageKeyEnum.CLOCKING_SOUND_FILENAME)
            .pipe(
                mergeMap((clockingSoundFilePath) => this.audioService.tryPreloadAudio(
                        this.clockingSoundId,
                        {
                            assetPath: clockingSoundFilePath,
                            isPathUrl: false
                        }
                    )
                )
            )
            .subscribe(() => {
                this.loadAudioSubscription.unsubscribe();
                this.loadAudioSubscription = null;
            });
    }

    public ngAfterViewInit(): void {
        this.initSubmitFormSubscription();
    }

    public ngOnDestroy(): void {
        this.clearSubscriptionOnDestroy();
        this.audioService.unloadAudio(this.clockingSoundId);
    }

    public volumeRangeValueChanged(newValue: number): void {
        this.audioService.playAudio(this.clockingSoundId, 0, newValue);
    }

    public clockingSoundDropdownValueChange(newValue: DropdownConfig) {
        this.clockingSoundDropdownCurrentOption = newValue;
        if (this.loadAudioSubscription != null) {
            this.loadAudioSubscription.unsubscribe();
            this.loadAudioSubscription = null;
        }
        this.loadAudioSubscription = this.audioService.unloadAudio(this.clockingSoundId)
            .pipe(
                mergeMap(() => this.audioService.tryPreloadAudio(
                        this.clockingSoundId,
                        {
                            assetPath: this.clockingSoundDropdownCurrentOption.value,
                            isPathUrl: false
                        }
                    )
                )
            )
            .subscribe(() => {
                this.loadAudioSubscription.unsubscribe();
                this.loadAudioSubscription = null;
            });
    }

    public updateLogoButtonClicked(): void {
        //trigger input image OnClick event to open the file browser
        this.inputImage.nativeElement.click();
    }

    public async updateAdminInfoButtonClicked(): Promise<void> {
        if (this.isUpdateUserInfoModalOpen) {
            return;
        }
        this.isUpdateUserInfoModalOpen = true;
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
        this.isUpdateUserInfoModalOpen = false;
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

    public secondaryModeToggleValueChanged(newKey: number): void {
        this.currentToggleOption = this.tabConfig[newKey].key;
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
                this.storageService.getValue(StorageKeyEnum.CLOCKING_SOUND_FILENAME),
            )
                .subscribe(([message,
                                communication,
                                currentSecondaryMode,
                                clockingSoundVolume,
                                logo,
                                adminUsername,
                                adminPassword,
                                clockingSoundFilename]) => {
                    if (!message && message !== '') {
                        throw new Error('Kiosk mode message should not be null');
                    }
                    if (!communication && communication !== '') {
                        throw new Error('Kiosk mode communication should not be null');
                    }
                    if (!currentSecondaryMode && currentSecondaryMode !== '0') {
                        throw new Error('current secondary mode should not be null');
                    }
                    if (!clockingSoundVolume) {
                        throw new Error('clocking sound volume should not be null');
                    }
                    if (!logo) {
                        throw new Error('logo should not be null');
                    }
                    if (!adminUsername) {
                        throw new Error('admin username should not be null');
                    }
                    if (!adminPassword) {
                        throw new Error('admin password should not be null');
                    }
                    if (!clockingSoundFilename) {
                        throw new Error('clocking sound filename should not be null !');
                    }
                    this.form.controls.kioskMessage.setValue(message);
                    this.form.controls.kioskCommunication.setValue(communication);
                    this.currentToggleOption = (Number(currentSecondaryMode) === 0) ? SecondaryMode.KIOSK : SecondaryMode.BACKGROUND;
                    this.form.controls.clockingVolume.setValue(Number(clockingSoundVolume));
                    this.logoSelectionFieldLogo = logo;
                    this.adminUsername = adminUsername;
                    this.adminPassword = adminPassword;
                    this.clockingSoundDropdownCurrentOption = this.clockingSoundDropdownConfig
                        .filter((dropdownOption: DropdownConfig) => dropdownOption.value === clockingSoundFilename)[0];
                });
        });
    }

    protected formSubmitted(): void {
        this.isSubmitted = true;
        if (!this.form.valid) {
            console.log('Invalid form content !');
            return;
        }
        console.log(this.clockingSoundDropdownCurrentOption);
        this.saveSubscription = this.loadingService.presentLoadingWhile({
            message: 'sauvegarde en cours...',
            event: () => zip(
                this.storageService.setValue(StorageKeyEnum.LOGO, this.logoSelectionFieldLogo),
                this.storageService.setValue(StorageKeyEnum.ADMIN_USERNAME, this.adminUsername),
                this.storageService.setValue(StorageKeyEnum.ADMIN_PASSWORD, this.adminPassword),
                this.storageService.setValue(StorageKeyEnum.KIOSK_MODE_MESSAGE, this.form.value.kioskMessage),
                this.storageService.setValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION, this.form.value.kioskCommunication),
                this.storageService.setValue(StorageKeyEnum.CURRENT_SECONDARY_MODE,
                    this.currentToggleOption === SecondaryMode.KIOSK ? '0' : '1'),
                this.storageService.setValue(StorageKeyEnum.CLOCKING_SOUND_VOLUME, this.form.value.clockingVolume.toString()),
                this.storageService.setValue(StorageKeyEnum.CLOCKING_SOUND_FILENAME, this.clockingSoundDropdownCurrentOption.value)
            )
        })
            .subscribe(() => {
                this.isSubmitted = false;
                this.validFormSubmittedEvent.emit(this.logoSelectionFieldLogo);
            });
    }
}
