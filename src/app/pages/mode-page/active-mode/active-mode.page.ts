import {Component, OnInit} from '@angular/core';
import {ModalController, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {NfcService} from '@app/services/nfc.service';
import {NavService} from '@app/services/nav/nav.service';
import {StorageService} from '@app/services/storage/storage.service';
import {SftpServices} from '@app/services/sftp/sftp.services';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {from, iif, of, Subject, Subscription, timer, zip} from 'rxjs';
import {PagePath} from '@app/services/nav/page-path.enum';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SfpStatus} from '@app/services/storage/sftp-status.enum';
import {map, mergeMap} from 'rxjs/operators';
import {WindowService} from '@app/services/window.service';
import {ClockingInfoModalModeEnum} from '@app/modals/clocking-info-modal/clocking-info-modal-mode.enum';
import {ModePagePage} from '@app/pages/mode-page/mode-page.page';
import {ToastService} from '@app/services/toast/toast.service';
import {BackgroundTaskService} from '@app/services/background-task.service';
import {AudioService} from '@app/services/audio/audio.service';
import {BackgroundService} from '@app/services/background.service';
import {PasswordCheckModalComponent} from '@app/modals/password-check-modal/password-check-modal.component';

@Component({
    selector: 'app-active-mode',
    templateUrl: './active-mode.page.html',
    styleUrls: ['./active-mode.page.scss'],
})
export class ActiveModePage extends ModePagePage implements ViewWillEnter, ViewWillLeave, OnInit {

    public headerMode: HeaderMode = HeaderMode.ACCOUNT_CREATION_PAGE;
    public footerMode: FooterMode = FooterMode.ACTIVE_MODE;

    public username: string;
    public nextSyncDatetime: string;
    public lastSyncDatetime: string;
    public currentSftpStatus: SfpStatus = SfpStatus.NOT_SET;
    public refreshHeader$: Subject<any>;

    public readonly sftpStatusEnum = SfpStatus;

    private isSftpSetup: boolean;
    private clockingRecordSyncCompletedSubscription: Subscription;
    private nfcBackgroundSubscription: Subscription;
    private nfcInternalBackgroundSubscription: Subscription;
    private backgroundModeExitedSubscription: Subscription;
    private backgroundModeExitedInternalSubscription: Subscription;
    private backgroundTagClockedEventFire: boolean;

    public constructor(protected nfcService: NfcService,
                       protected storageService: StorageService,
                       protected sqliteService: SQLiteService,
                       protected windowService: WindowService,
                       protected toastService: ToastService,
                       protected audioService: AudioService,
                       private backgroundService: BackgroundService,
                       private sftpService: SftpServices,
                       private navService: NavService,
                       private backgroundTaskService: BackgroundTaskService,
                       protected modalCtrl: ModalController) {
        super(nfcService,
            storageService,
            sqliteService,
            windowService,
            toastService,
            audioService,
            modalCtrl);
        this.refreshHeader$ = new Subject<string>();
    }

    public ionViewWillEnter(): void {
        if (this.navService.params()) {
            if (this.navService.param<boolean>('redirectToParams')) {
                this.navService.push(PagePath.SETTINGS_MENU);
            } else {
                this.initPage();
            }
        } else {
            this.initPage();
        }
    }

    public ngOnInit(): void {
        this.refreshHeader$ = new Subject<string>();
    }

    public ionViewWillLeave(): void {
        this.leaveModePage();

        this.backgroundService.disableBackgroundMode();

        if (this.clockingRecordSyncCompletedSubscription && !this.clockingRecordSyncCompletedSubscription.closed) {
            this.clockingRecordSyncCompletedSubscription.unsubscribe();
        }

        if (this.nfcBackgroundSubscription && !this.nfcBackgroundSubscription.closed) {
            this.nfcBackgroundSubscription.unsubscribe();
        }

        if (this.nfcInternalBackgroundSubscription && !this.nfcInternalBackgroundSubscription) {
            this.nfcInternalBackgroundSubscription.unsubscribe();
        }

        if (this.clockingRecordSyncCompletedSubscription && !this.clockingRecordSyncCompletedSubscription.closed) {
            this.clockingRecordSyncCompletedSubscription.unsubscribe();
        }

        if (this.backgroundModeExitedSubscription && !this.backgroundModeExitedSubscription.closed) {
            this.backgroundModeExitedSubscription.unsubscribe();
        }

        if (this.backgroundModeExitedInternalSubscription && !this.backgroundModeExitedInternalSubscription.closed) {
            this.backgroundModeExitedInternalSubscription.unsubscribe();
        }

        this.backgroundService.disableBackgroundMode();
    }

    public initPage(): void {
        this.enterModePage();

        this.backgroundService.enableBackgroundMode();
        this.backgroundTagClockedEventFire = false;

        if (this.refreshHeader$) {
            this.refreshHeader$.next();
        }

        this.clockingRecordSyncCompletedSubscription = this.backgroundTaskService.syncCompleted$
            .subscribe((syncInfo) => {
                this.nextSyncDatetime = syncInfo.nextSyncDate;
                this.lastSyncDatetime = syncInfo.lastSyncDate;
            });

        this.storageGetterSubscription = zip(
            this.storageService.getValue(StorageKeyEnum.ADMIN_USERNAME),
            this.storageService.getValue(StorageKeyEnum.SFTP_SETUP),
            this.storageService.getValue(StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME),
            this.storageService.getValue(StorageKeyEnum.LAST_SYNCHRONISATION_DATETIME)
        ).pipe(
            mergeMap(([adminUsername, isSftpSetup, nextSync, lastSync]) => {
                this.username = adminUsername;
                this.isSftpSetup = Number(isSftpSetup) === 1;

                this.nextSyncDatetime = nextSync;
                this.lastSyncDatetime = lastSync;

                if (this.isSftpSetup) {
                    return this.sftpService.testConnection();
                }
                this.currentSftpStatus = SfpStatus.NOT_SET;
                return of(null);
            })
        ).subscribe((isConnected) => {
            if (isConnected != null) {
                this.currentSftpStatus = isConnected ? this.sftpStatusEnum.READY : this.sftpStatusEnum.ERROR;
            }
        });

        this.nfcSubscription = this.nfcService.nfcTags$.subscribe(
            (data) => {
                return this.manageClocking(data.id, ClockingInfoModalModeEnum.ACTIVE_MODE);
            });
    }

    public setupForBackgroundMode(): void {
        if (!this.nfcBackgroundSubscription) {
            this.nfcBackgroundSubscription = this.nfcService.addNdefFormatableCallback()
                .subscribe((clockingEvent) => {
                    this.backgroundTagClockedEventFire = true;
                    this.nfcInternalBackgroundSubscription =
                        from(this.manageClocking(clockingEvent.tag.id, ClockingInfoModalModeEnum.KIOSK_MODE, true))
                            .pipe(
                                map((manageResult: boolean) =>
                                    this.backgroundService.activateBackgroundMode(
                                        manageResult === true ? undefined : ToastService.TOAST_DEFAULT_DURATION)
                                ),
                            )
                            .subscribe(() => {
                                this.nfcInternalBackgroundSubscription.unsubscribe();
                            });
                });
        }

        if (!this.backgroundModeExitedSubscription) {
            this.backgroundModeExitedSubscription = this.backgroundService.getBackgroundModeExited$().subscribe(() => {
                this.lockClockingDetection();
                // The use of a timer here is not proper at all, but I did not think of another solution in time
                this.backgroundModeExitedInternalSubscription = timer(100).pipe(
                    mergeMap(() => {
                        if (this.backgroundTagClockedEventFire === true) {
                            this.backgroundTagClockedEventFire = false;
                            return of(true);
                        }
                        return from(this.presentPasswordCheckModal());
                    }),
                    map((result) => {
                        if (!result) {
                            this.backgroundService.activateBackgroundMode();
                        }
                    })
                ).subscribe(() => this.backgroundModeExitedInternalSubscription.unsubscribe());
            });
        }
    }

    private async presentPasswordCheckModal(): Promise<boolean> {
        const modal = await this.modalCtrl.create({
            component: PasswordCheckModalComponent,
            keyboardClose: true,
            componentProps: {
                modalTitle: 'Quitter le mode background',
            },
            cssClass: 'auto-height',
            backdropDismiss: false,
        });
        await modal.present();

        const {role} = await modal.onWillDismiss();
        if (role === 'confirm') {
            this.unlockClockingDetection();
            this.nfcBackgroundSubscription.unsubscribe();
            this.nfcBackgroundSubscription = null;
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
}
