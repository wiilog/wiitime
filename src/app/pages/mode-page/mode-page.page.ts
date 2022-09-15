import {Component} from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {NfcService} from '@app/services/nfc.service';
import {StorageService} from '@app/services/storage/storage.service';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {WindowService} from '@app/services/window.service';
import {ModalController} from '@ionic/angular';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {mergeMap, tap} from 'rxjs/operators';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {ClockingInfoModalPage} from '@app/modals/clocking-info-modal/clocking-info-modal.page';
import {ClockingInfoModalModeEnum} from '@app/modals/clocking-info-modal/clocking-info-modal-mode.enum';
import {ToastService} from '@app/services/toast/toast.service';
import {ToastTypeEnum} from '@app/services/toast/toast-type.enum';
import {AudioService} from '@app/services/audio/audio.service';
import {environment} from '../../../environments/environment';

@Component({template: ''})
export abstract class ModePagePage {
    public isPortraitMode: boolean;
    public currentDatetime: string;

    protected isClockingInfoModalOpen: boolean;
    protected nfcSubscription: Subscription;
    protected storageGetterSubscription: Subscription;

    private readonly clockingSoundId = environment.clockingSoundId;
    private readonly clockingSoundFilePath = environment.clockingSoundFilePath;
    private timerSubscription: Subscription;
    private windowSizeSubscription: Subscription;
    private soundSetterSubscription: Subscription;

    protected constructor(protected nfcService: NfcService,
                          protected storageService: StorageService,
                          protected sqliteService: SQLiteService,
                          protected windowService: WindowService,
                          protected toastService: ToastService,
                          protected audioService: AudioService,
                          protected modalCtrl: ModalController) {
    }

    /**
     * Call it in ionViewWillEnter() of the child class
     */
    public enterModePage(): void {
        this.isClockingInfoModalOpen = false;
        this.isPortraitMode = this.windowService.isPortraitMode();

        this.timerSubscription = timer(0, 1000).subscribe(() => {
            this.currentDatetime = new Date().toISOString();
        });

        this.windowSizeSubscription = this.windowService.getWindowResizedObservable().subscribe(() => {
            this.isPortraitMode = this.windowService.isPortraitMode();
        });

        this.soundSetterSubscription = this.audioService.tryPreloadAudio(this.clockingSoundId,
            {
                assetPath: this.clockingSoundFilePath,
                isPathUrl: false
            }
        ).subscribe((result: boolean) => console.log('sound set result:', result));
    }


    /**
     * Call it in ionViewWillLeave() of the child class
     */
    public leaveModePage(): void {
        if (this.nfcSubscription && !this.nfcSubscription.closed) {
            this.nfcSubscription.unsubscribe();
        }
        if (this.timerSubscription && !this.timerSubscription.closed) {
            this.timerSubscription.unsubscribe();
        }
        if (this.storageGetterSubscription && !this.storageGetterSubscription.closed) {
            this.storageGetterSubscription.unsubscribe();
        }
        if (this.windowSizeSubscription && !this.windowSizeSubscription.closed) {
            this.windowSizeSubscription.unsubscribe();
        }
        if (this.soundSetterSubscription && !this.soundSetterSubscription.closed) {
            this.soundSetterSubscription.unsubscribe();
        }

        this.audioService.unloadAudio(this.clockingSoundId);
    }

    /**
     * check if the badge with the given id has been recently clocked and if not save it's clocking in the database
     * and then open the clocking-info-modal with the given mode. Child page should init the nfcSubscription attribute
     * with a subscription that call this function when a badge is clocked.
     *
     * @param badgeId the id of the clocked badge
     * @param clockingInfoModalMode the mode to apply to the clocking-info-modal
     *
     * @protected
     */
    protected async manageClocking(badgeId: number[], clockingInfoModalMode: ClockingInfoModalModeEnum): Promise<any> {
        if (this.isClockingInfoModalOpen) {
            return Promise.resolve(false);
        }
        this.isClockingInfoModalOpen = true;
        const hexId = this.nfcService.convertIdToHex(badgeId);
        let openModal = false;

        this.audioService.playAudio(this.clockingSoundId, 0);

        await this.storageService.getValue(StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING)
            .pipe(
                mergeMap((delay) => this.sqliteService.getClockingRecordInInterval(hexId, Number(delay))),
                tap((clockingRecords: ClockingRecord[]) => {
                    if (clockingRecords.length === 0) {
                        openModal = true;
                    }
                })
            ).toPromise();


        if (openModal) {
            const modal = await this.modalCtrl.create({
                component: ClockingInfoModalPage,
                keyboardClose: true,
                componentProps: {
                    clockedBadgeNumber: hexId,
                    modalMode: clockingInfoModalMode
                },
                cssClass: 'clocking-info-modal',
                backdropDismiss: false,
            });
            await modal.present();
            await modal.onWillDismiss();
        } else {
            await this.toastService.displayToast(`Ce badgeage n'a pas été pris
            en compte, car le badge numéro ${hexId} a déjà été badgé récemment`, ToastTypeEnum.ERROR);
        }
        this.isClockingInfoModalOpen = false;
        return Promise.resolve(true);
    }
}
