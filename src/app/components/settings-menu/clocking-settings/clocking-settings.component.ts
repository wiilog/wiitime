import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
import {FormBuilder, Validators} from '@angular/forms';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {WindowSizeService} from '@app/services/window-size.service';
import {SettingsMenuComponent} from '@app/components/settings-menu/settings-menu.component';
import {StorageService} from '@app/services/storage/storage.service';
import {Subscription, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {LoadingService} from '@app/services/loading.service';

@Component({
    selector: 'app-clocking-settings',
    templateUrl: './clocking-settings.component.html',
    styleUrls: ['./clocking-settings.component.scss'],
})
export class ClockingSettingsComponent extends SettingsMenuComponent implements OnInit, OnDestroy, AfterViewInit {

    //storage duration field settings
    public storageDurationFormControlName = 'storageDuration';
    public storageDurationFieldName = 'Durée d\'archivage*';
    public storageDurationEndText = 'jours';

    //display clocking from field settings
    public displayClockingFromFromControlName = 'displayClockingFrom';
    public displayClockingFromFieldName = 'Affichage des badgeages sur*';
    public displayClockingFromEndText = 'heures';

    //delay between two clocking field settings
    public delayBetweenTwoClockingFormControlName = 'delayBetweenTwoClocking';
    public delayBetweenTwoClockingFieldName = 'Délai entre 2 badgeages*';
    public delayBetweenTwoClockingEndText = 'minutes';

    //pop-up display duration field settings
    public popupDisplayDurationFormControlName = 'popupDisplayDuration';
    public popupDisplayDurationFieldName = 'Durée d\'affichage pop-up mode kiosk*';
    public popupDisplayDurationEndText = 'secondes';

    private valueSetterSubscription: Subscription;
    private saveSubscription: Subscription;

    public constructor(protected screenOrientationService: ScreenOrientationService,
                       protected windowSizeService: WindowSizeService,
                       private storageService: StorageService,
                       private loadingService: LoadingService,
                       private formBuilder: FormBuilder,
                       private platform: Platform,
                       private ngZone: NgZone,) {
        super(screenOrientationService,
            windowSizeService);
        this.form = this.formBuilder.group({
            storageDuration: ['', [Validators.required, Validators.min(0), Validators.max(365), Validators.maxLength(3)]],
            displayClockingFrom: ['', [Validators.required, Validators.min(1), Validators.max(168)]],
            delayBetweenTwoClocking: ['', [Validators.required, Validators.min(0), Validators.max(60)]],
            popupDisplayDuration: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
        });
    }

    public ngOnInit(): void {
        this.isSubmitted = false;
        this.updateViewAfterWindowSizeChanged();
        this.windowSizeSubscription = this.windowSizeService.getWindowResizedObservable().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updateViewAfterWindowSizeChanged();
                });
            }
        );

        this.valueSetterSubscription = zip(this.storageService.getValue(StorageKeyEnum.CLOCKING_STORAGE_DURATION),
            this.storageService.getValue(StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL),
            this.storageService.getValue(StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING),
            this.storageService.getValue(StorageKeyEnum.CLOCKING_POPUP_DISPLAY_DURATION))
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

    public ngAfterViewInit(): void {
        this.submitFormSubscription = this.submitForm$.subscribe(() => {
            this.formSubmitted();
        });
    }

    public ngOnDestroy(): void {
        this.windowSizeSubscription.unsubscribe();

        if (this.submitFormSubscription && !this.submitFormSubscription.closed) {
            this.submitFormSubscription.unsubscribe();
        }

        if (this.valueSetterSubscription && !this.valueSetterSubscription.closed) {
            this.valueSetterSubscription.unsubscribe();
        }

        if (this.saveSubscription && !this.saveSubscription.closed) {
            this.saveSubscription.unsubscribe();
        }
        console.log('leave clocking settings');
    }

    public formSubmitted(): void {
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
                    this.storageService.setValue(StorageKeyEnum.CLOCKING_POPUP_DISPLAY_DURATION, this.form.value.popupDisplayDuration.toString())
                )
            }
        ).subscribe(() => {
            this.validFormSubmittedEvent.emit();
        });
    }
}
