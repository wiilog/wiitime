import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {WindowService} from '@app/services/window.service';
import {SettingsMenuComponent} from '@app/components/settings-menu/settings-menu.component';
import {StorageService} from '@app/services/storage/storage.service';
import {zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {LoadingService} from '@app/services/loading.service';

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

    public constructor(protected windowService: WindowService,
                       private storageService: StorageService,
                       private loadingService: LoadingService,
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
    }

    protected initContent() {
        this.valueSetterSubscription = zip(this.storageService.getValue(StorageKeyEnum.CLOCKING_STORAGE_DURATION),
            this.storageService.getValue(StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL),
            this.storageService.getValue(StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING),
            this.storageService.getValue(StorageKeyEnum.CLOCKING_INFO_MODAL_DISPLAY_DURATION))
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
                event: () => zip(this.storageService.setValue(StorageKeyEnum.CLOCKING_STORAGE_DURATION, this.form.value.storageDuration.toString()),
                    this.storageService.setValue(StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL, this.form.value.displayClockingFrom.toString()),
                    this.storageService.setValue(StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING, this.form.value.delayBetweenTwoClocking.toString()),
                    this.storageService.setValue(StorageKeyEnum.CLOCKING_INFO_MODAL_DISPLAY_DURATION, this.form.value.popupDisplayDuration.toString())
                )
            }
        ).subscribe(() => {
            this.validFormSubmittedEvent.emit();
            this.isSubmitted = false;
        });
    }
}
