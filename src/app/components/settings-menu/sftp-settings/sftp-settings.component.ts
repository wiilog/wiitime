import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {SettingsMenuComponent} from '@app/components/settings-menu/settings-menu.component';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {WindowSizeService} from '@app/services/window-size.service';
import {FormBuilder, Validators} from '@angular/forms';
import {StorageService} from '@app/services/storage/storage.service';
import {LoadingService} from '@app/services/loading.service';
import {FormSize} from '@app/components/form/form-size-enum';
import {Observable, of, Subscription, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {FormInputTypeEnum} from '@app/components/form/form-input/form-input-type.enum';
import {SftpServices} from '@app/services/sftp.services';
import {DateService} from '@app/services/date.service';
import {BackgroundTaskService} from "@app/services/background-task.service";

@Component({
    selector: 'app-sftp-settings',
    templateUrl: './sftp-settings.component.html',
    styleUrls: ['./sftp-settings.component.scss'],
})
export class SftpSettingsComponent extends SettingsMenuComponent implements OnInit, AfterViewInit, OnDestroy {

    public readonly formInputTypeEnum = FormInputTypeEnum;

    //server address field settings
    public readonly serverAddressFormControlName = 'serverAddress';
    public readonly serverAddressName = 'serveur SFTP*';
    public readonly serverAddressMaxLength = 40;
    public readonly serverAddressSize: FormSize = FormSize.MEDIUM;

    //server port field settings
    public readonly serverPortFromControlName = 'serverPort';
    public readonly serverPortFieldName = 'Port*';
    public readonly serverPortMaxValue = 65535;
    public readonly serverPortMinValue = 0;

    //server username field settings
    public readonly serverUsernameFormControlName = 'serverUsername';
    public readonly serverUsernameFieldName = 'Nom d\'utilisateur*';
    public readonly serverUsernameMaxLength = 25;
    public readonly serverUsernameSize: FormSize = FormSize.MEDIUM;

    //server password field settings
    public readonly serverPasswordFormControlName = 'serverPassword';
    public readonly serverPasswordFieldName = 'Mot de passe';
    public readonly serverPasswordMaxLength = 30;
    public readonly serverPasswordSize: FormSize = FormSize.MEDIUM;

    //server path field settings
    public readonly serverPathFormControlName = 'serverPath';
    public readonly serverPathFieldName = 'Chemin*';
    public readonly serverPathMaxLength = 100;
    public readonly serverPathSize: FormSize = FormSize.MEDIUM;

    //synchronisation frequency field settings
    public readonly syncFrequencyFormControlName = 'syncFrequency';
    public readonly syncFrequencyFieldName = 'Toutes les*';
    public readonly syncFrequencyEndText = 'heures';
    public readonly syncFrequencyMinValue = 1;
    public readonly syncFrequencyMaxValue = 168;

    //synchronisation begin time field settings
    public readonly syncBeginTimeFormControlName = 'syncBeginTime';
    public readonly syncBeginTimeFieldName = 'heures de début*';

    private isConnexionTestOngoing: boolean;
    private syncBeginTimeStartValue: Date;
    private syncFrequencyStartValue: number;
    private connexionTestSubscription: Subscription;

    public constructor(protected screenOrientationService: ScreenOrientationService,
                       protected windowSizeService: WindowSizeService,
                       private storageService: StorageService,
                       private loadingService: LoadingService,
                       private sftpService: SftpServices,
                       private dateService: DateService,
                       private backgroundTaskService: BackgroundTaskService,
                       private formBuilder: FormBuilder,
                       protected ngZone: NgZone,) {
        super(screenOrientationService, windowSizeService, ngZone);
        this.form = this.formBuilder.group({
            serverAddress: ['', [Validators.required, Validators.maxLength(this.serverAddressMaxLength)]],
            serverPort: ['', [Validators.required,
                Validators.min(this.serverPortMinValue),
                Validators.max(this.serverPortMaxValue)]],
            serverUsername: ['', [Validators.required, Validators.maxLength(this.serverUsernameMaxLength)]],
            serverPassword: ['', [Validators.maxLength(this.serverPasswordMaxLength)]],
            serverPath: ['', [Validators.required,
                Validators.maxLength(this.serverPathMaxLength),
                Validators.pattern('^(?:[a-z]:)?[\\/\\\\]{0,2}(?:[.\\/\\\\ ](?![.\\/\\\\\\n])|[^<>:"|?!*.\\/\\\\ \\n])+$')]],
            syncFrequency: ['', [Validators.required, Validators.min(1), Validators.max(168)]],
            syncBeginTime: ['', [Validators.required]],
        });
    }

    public ngOnInit(): void {
        this.initSettingsMenu();
        this.isConnexionTestOngoing = false;
    }

    public ngAfterViewInit(): void {
        this.initSubmitFormSubscription();
    }

    public ngOnDestroy(): void {
        this.clearSubscriptionOnDestroy();
        if (this.connexionTestSubscription && !this.connexionTestSubscription.closed) {
            this.connexionTestSubscription.unsubscribe();
        }
    }

    public testSftpConnectionButtonClicked() {
        if (!this.isConnexionTestOngoing) {
            this.isConnexionTestOngoing = true;
            this.connexionTestSubscription = this.sftpService.testConnection()
                .subscribe((result) => {
                    console.log('connection is good ?', result);
                    //Todo spawn toast with result when created
                    this.isConnexionTestOngoing = false;
                });
        }
    }

    protected initContent(): void {
        this.valueSetterSubscription = zip(this.storageService.getValue(StorageKeyEnum.SFTP_SETUP),
            this.storageService.getValue(StorageKeyEnum.SFTP_SERVER_ADDRESS),
            this.storageService.getValue(StorageKeyEnum.SFTP_PORT),
            this.storageService.getValue(StorageKeyEnum.SFTP_USERNAME),
            this.storageService.getValue(StorageKeyEnum.SFTP_PASSWORD),
            this.storageService.getValue(StorageKeyEnum.SFTP_SAVE_PATH),
            this.storageService.getValue(StorageKeyEnum.SYNCHRONISATION_FREQUENCY),
            this.storageService.getValue(StorageKeyEnum.SYNCHRONISATION_BEGIN_DATETIME))
            .subscribe(([sftpSetup,
                            serverAddress,
                            serverPort,
                            serverUsername,
                            serverPassword,
                            serverPath,
                            syncFrequency,
                            syncBeginTime]) => {
                if (Number(sftpSetup)) {
                    if (!serverAddress) {
                        throw new Error('server address should not be null');
                    }
                    if (!serverPort) {
                        throw new Error('server port should not be null');
                    }
                    if (!serverUsername) {
                        throw new Error('server username should not be null');
                    }
                    if (!serverPassword) {
                        serverPassword = '';
                    }
                    if (!serverPath) {
                        throw new Error('server path should not be null');
                    }

                    this.form.controls.serverAddress.setValue(serverAddress);
                    this.form.controls.serverPort.setValue(serverPort);
                    this.form.controls.serverUsername.setValue(serverUsername);
                    this.form.controls.serverPassword.setValue(serverPassword);
                    this.form.controls.serverPath.setValue(serverPath);
                }

                if (!syncFrequency) {
                    throw new Error('synchronisation frequency should not be null');
                }
                if (!syncBeginTime) {
                    throw new Error('synchronisation begin time should not be null');
                }
                this.form.controls.syncFrequency.setValue(syncFrequency);
                this.syncFrequencyStartValue = Number(syncFrequency);
                this.syncBeginTimeStartValue = new Date(syncBeginTime);
                this.form.controls.syncBeginTime.setValue(this.dateService
                    .utfDatetimeToLocalTime(this.syncBeginTimeStartValue, true).substring(0, 5));
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
                event: () => zip(this.storageService.setValue(StorageKeyEnum.SFTP_SERVER_ADDRESS, this.form.value.serverAddress),
                    this.storageService.setValue(StorageKeyEnum.SFTP_PORT, this.form.value.serverPort.toString()),
                    this.storageService.setValue(StorageKeyEnum.SFTP_USERNAME, this.form.value.serverUsername),
                    this.storageService.setValue(StorageKeyEnum.SFTP_PASSWORD, this.form.value.serverPassword),
                    this.storageService.setValue(StorageKeyEnum.SFTP_SAVE_PATH, this.form.value.serverPath),
                    this.backgroundTaskService.syncParametersHaveChanged(this.syncBeginTimeStartValue,
                        this.form.value.syncBeginTime, this.syncFrequencyStartValue, Number(this.form.value.syncFrequency)),
                    this.storageService.setValue(StorageKeyEnum.SFTP_SETUP, '1')
                )
            }
        ).subscribe(() => {
            this.isSubmitted = false;
            this.validFormSubmittedEvent.emit();
        });
    }
}
