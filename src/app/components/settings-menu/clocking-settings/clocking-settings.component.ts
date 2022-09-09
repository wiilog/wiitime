import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {WindowService} from '@app/services/window.service';
import {SettingsMenuComponent} from '@app/components/settings-menu/settings-menu.component';
import {StorageService} from '@app/services/storage/storage.service';
import {from, Subscription, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {LoadingService} from '@app/services/loading.service';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {TableName} from '@app/services/sqlite/table-name';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {catchError, mergeMap} from 'rxjs/operators';
import {FileService} from '@app/services/file.service';
import {ToastService} from '@app/services/toast/toast.service';
import {ToastTypeEnum} from '@app/services/toast/toast-type.enum';

@Component({
    selector: 'app-clocking-settings',
    templateUrl: './clocking-settings.component.html',
    styleUrls: ['./clocking-settings.component.scss'],
})
export class ClockingSettingsComponent extends SettingsMenuComponent implements OnInit, OnDestroy, AfterViewInit {

    //storage duration field settings
    public readonly storageDurationFormControlName = 'storageDuration';
    public readonly storageDurationFieldName = 'Durée d\'archivage*';
    public readonly storageDurationEndText = 'jours';
    public readonly storageDurationMinValue = 1;
    public readonly storageDurationMaxValue = 365;

    //export button settings
    public readonly isExportButtonFillingScreenWidth: boolean = true;
    public readonly areExportButtonColorsSwapped: boolean = true;

    //display clocking from field settings
    public readonly displayClockingFromFromControlName = 'displayClockingFrom';
    public readonly displayClockingFromFieldName = 'Affichage des badgeages sur*';
    public readonly displayClockingFromEndText = 'heures';
    public readonly displayClockingFromMinValue = 1;
    public readonly displayClockingFromMaxValue = 168;

    //delay between two clocking field settings
    public readonly delayBetweenTwoClockingFormControlName = 'delayBetweenTwoClocking';
    public readonly delayBetweenTwoClockingFieldName = 'Délai entre 2 badgeages*';
    public readonly delayBetweenTwoClockingEndText = 'minutes';
    public readonly delayBetweenTwoClockingMinValue = 1;
    public readonly delayBetweenTwoClockingMaxValue = 60;

    //pop-up display duration field settings
    public readonly popupDisplayDurationFormControlName = 'popupDisplayDuration';
    public readonly popupDisplayDurationFieldName = 'Durée d\'affichage pop-up mode kiosk*';
    public readonly popupDisplayDurationEndText = 'secondes';
    public readonly popupDisplayDurationMinValue = 0;
    public readonly popupDisplayDurationMaxValue = 120;

    private clockingDataExportSubscription: Subscription;

    public constructor(protected windowService: WindowService,
                       private toastService: ToastService,
                       private storageService: StorageService,
                       private loadingService: LoadingService,
                       private sqliteService: SQLiteService,
                       private fileService: FileService,
                       private formBuilder: FormBuilder,
                       protected ngZone: NgZone,) {
        super(windowService, ngZone);
        this.form = this.formBuilder.group({
            storageDuration: ['', [Validators.required,
                Validators.min(this.storageDurationMinValue),
                Validators.max(this.storageDurationMaxValue)]],
            displayClockingFrom: ['', [Validators.required,
                Validators.min(this.displayClockingFromMinValue),
                Validators.max(this.displayClockingFromMaxValue)]],
            delayBetweenTwoClocking: ['', [Validators.required,
                Validators.min(this.delayBetweenTwoClockingMinValue),
                Validators.max(this.delayBetweenTwoClockingMaxValue)]],
            popupDisplayDuration: ['', [Validators.required,
                Validators.min(this.popupDisplayDurationMinValue),
                Validators.max(this.popupDisplayDurationMaxValue)]],
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

        if (this.clockingDataExportSubscription && !this.clockingDataExportSubscription.closed) {
            this.clockingDataExportSubscription.unsubscribe();
        }
    }

    public exportClockingDataButtonClicked(): void {
        let exportedFileName: string;
        if (!this.clockingDataExportSubscription) {
            this.clockingDataExportSubscription = this.loadingService.presentLoadingWhile({
                    message: 'export des données en cours...',
                    event: () => zip(
                        this.sqliteService.get<ClockingRecord>(TableName.CLOCKING_RECORD, {is_synchronised: '0'}),
                        this.fileService.getLocalDataExportFileName()
                    ).pipe(
                        mergeMap(([clockingRecords, filename]) => {
                            exportedFileName = filename;
                            return this.fileService.writeFile(filename, clockingRecords, null, false);
                        }),
                        mergeMap(() =>
                            from(this.toastService.displayToast(
                                `Fichier d\'export \'${exportedFileName}\' sauvegardé dans les documents avec succès`,
                                ToastTypeEnum.SUCCESS))
                        ),
                        catchError((err) => {
                            console.log(err);
                            return this.toastService.displayToast(err, ToastTypeEnum.ERROR);
                        })
                    )
                }
            ).subscribe(() => {
                this.clockingDataExportSubscription.unsubscribe();
                this.clockingDataExportSubscription = null;
            });
        }

    }

    protected initContent() {
        this.valueSetterSubscription = zip(
            this.storageService.getValue(StorageKeyEnum.CLOCKING_STORAGE_DURATION),
            this.storageService.getValue(StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL),
            this.storageService.getValue(StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING),
            this.storageService.getValue(StorageKeyEnum.CLOCKING_INFO_MODAL_DISPLAY_DURATION)
        )
            .subscribe(([storageDuration,
                            displayClockingFrom,
                            delayBetweenTwoClocking,
                            popupDisplayDuration]) => {
                if (!storageDuration) {
                    throw new Error('clocking storage duration should not be null');
                }
                if (!displayClockingFrom) {
                    throw new Error('clocking display interval should not be null');
                }
                if (!delayBetweenTwoClocking) {
                    throw new Error('delay between two clocking should not be null');
                }
                if (!popupDisplayDuration) {
                    throw new Error('clocking pop-up display duration should not be null');
                }

                this.form.controls.storageDuration.setValue(storageDuration);
                this.form.controls.displayClockingFrom.setValue(displayClockingFrom);
                this.form.controls.delayBetweenTwoClocking.setValue(delayBetweenTwoClocking);
                this.form.controls.popupDisplayDuration.setValue(popupDisplayDuration);
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
                event: () => zip(
                    this.storageService.setValue(StorageKeyEnum.CLOCKING_STORAGE_DURATION,
                        this.form.value.storageDuration.toString()),
                    this.storageService.setValue(StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL,
                        this.form.value.displayClockingFrom.toString()),
                    this.storageService.setValue(StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING,
                        this.form.value.delayBetweenTwoClocking.toString()),
                    this.storageService.setValue(StorageKeyEnum.CLOCKING_INFO_MODAL_DISPLAY_DURATION,
                        this.form.value.popupDisplayDuration.toString()
                    )
                )
            }
        ).subscribe(() => {
            this.validFormSubmittedEvent.emit();
            this.isSubmitted = false;
        });
    }
}
