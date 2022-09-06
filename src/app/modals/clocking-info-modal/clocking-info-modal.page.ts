import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {iif, Observable, of, Subscription, timer} from 'rxjs';
import {LoadingService} from '@app/services/loading.service';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {StorageService} from '@app/services/storage/storage.service';
import {ModalController, Platform} from '@ionic/angular';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {mergeMap, tap} from 'rxjs/operators';
import {DateService} from '@app/services/date.service';
import {ClockingInfo} from '@app/modals/clocking-info-modal/clocking-info';
import {ClockingInfoModalModeEnum} from '@app/modals/clocking-info-modal/clocking-info-modal-mode.enum';

@Component({
    selector: 'app-clocking-info-modal',
    templateUrl: './clocking-info-modal.page.html',
    styleUrls: ['./clocking-info-modal.page.scss'],
})
export class ClockingInfoModalPage implements OnInit, OnDestroy {

    @Input()
    public clockedBadgeNumber: string;

    @Input()
    public modalMode: ClockingInfoModalModeEnum;

    public isModalLoaded: boolean;
    public modalTitle = 'Badge n°';
    public badgeRegisteredClocking: Map<ClockingRecord, ClockingInfo>;
    public clockingDisplayInterval: number;

    public readonly clockingInfoModalModeEnum = ClockingInfoModalModeEnum;

    //validate button settings
    public readonly isValidateButtonLarge: boolean = false;

    private readonly firstClockingText = 'Aujourd\'hui';
    private readonly yesterdayClockingText = 'Hier';
    private readonly emptyText = '';

    private modalDisplayDuration: number;
    private modalLoadingSubscription: Subscription;
    private backButtonSubscription: Subscription;
    private closingTimerSubscription: Subscription;

    public constructor(private loadingService: LoadingService,
                       private sqliteService: SQLiteService,
                       private storageService: StorageService,
                       private modalController: ModalController,
                       private dateService: DateService,
                       private platform: Platform) {
    }

    public ngOnInit(): void {
        this.isModalLoaded = false;
        this.modalTitle = `${this.modalTitle}${this.clockedBadgeNumber}`;

        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(100, () =>
            this.confirmButtonClicked()
        );

        this.modalLoadingSubscription = this.loadingService.presentLoadingWhile({
            message: 'chargement en cours...',
            event: () => this.sqliteService.registerClocking(this.clockedBadgeNumber)
                .pipe(
                    mergeMap(() =>
                        iif(() => this.modalMode === ClockingInfoModalModeEnum.KIOSK_MODE,
                            this.setClockingInfoModalDisplayDuration(),
                            of(null)
                        )
                    ),
                    mergeMap(() => this.storageService.getValue(StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL)),
                    mergeMap((clockingDisplayInterval: string) => {
                        this.clockingDisplayInterval = Number(clockingDisplayInterval);
                        return this.sqliteService.getClockingRecordInInterval(this.clockedBadgeNumber, this.clockingDisplayInterval * 60);
                    }),
                    tap((clockingRecords: ClockingRecord[]) => {
                        this.fillClockingInfo(clockingRecords);
                    })
                )
        }).subscribe(() => {
            this.isModalLoaded = true;
            if (this.modalMode === ClockingInfoModalModeEnum.KIOSK_MODE) {
                this.closingTimerSubscription = timer(this.modalDisplayDuration * 1000)
                    .subscribe(() => this.confirmButtonClicked());
            }
        });
    }

    public ngOnDestroy(): void {
        if (this.backButtonSubscription && !this.backButtonSubscription.closed) {
            this.backButtonSubscription.unsubscribe();
        }
        if (this.modalLoadingSubscription && !this.modalLoadingSubscription.closed) {
            this.modalLoadingSubscription.unsubscribe();
        }
        if (this.closingTimerSubscription && !this.closingTimerSubscription.closed) {
            this.closingTimerSubscription.unsubscribe();
        }
    }

    public confirmButtonClicked(): Promise<boolean> {
        return this.modalController.dismiss({},
            'confirm');
    }

    public fillClockingInfo(clockingRecords: ClockingRecord[]) {
        this.badgeRegisteredClocking = new Map<ClockingRecord, ClockingInfo>();
        let lastDayDate = null;
        let lastClocking = null;
        let yesterday = true;
        clockingRecords.forEach((clocking: ClockingRecord) => {
            const currentClockingDate = new Date(clocking.clocking_date);
            if (lastClocking === null) {
                this.badgeRegisteredClocking.set(clocking, {
                    isFirst: true,
                    dateText: this.firstClockingText,
                    isLastOfDay: false
                });
                lastDayDate = currentClockingDate;
            } else {
                if (this.dateService.utfDatetimeToLocalDate(currentClockingDate, false)
                    < this.dateService.utfDatetimeToLocalDate(lastDayDate, false)) {
                    let text = this.dateService.datetimeToDaySlashMonthString(currentClockingDate);
                    if (yesterday) {
                        yesterday = false;
                        if (this.dateService.isFromDayBefore(currentClockingDate, lastDayDate)) {
                            text = this.yesterdayClockingText;
                        }
                    }
                    this.badgeRegisteredClocking.set(clocking, {
                        isFirst: false,
                        dateText: text,
                        isLastOfDay: false
                    });
                    this.badgeRegisteredClocking.get(lastClocking).isLastOfDay = true;
                    lastDayDate = currentClockingDate;
                } else {
                    this.badgeRegisteredClocking.set(clocking, {
                        isFirst: false,
                        dateText: this.emptyText,
                        isLastOfDay: false
                    });
                }
            }
            lastClocking = clocking;
        });
    }

    private setClockingInfoModalDisplayDuration(): Observable<any> {
        return this.storageService.getValue(StorageKeyEnum.CLOCKING_INFO_MODAL_DISPLAY_DURATION)
            .pipe(
                tap((displayDuration: string) => {
                    console.log(Number(displayDuration));
                    this.modalDisplayDuration = Number(displayDuration);
                })
            );
    }
}
