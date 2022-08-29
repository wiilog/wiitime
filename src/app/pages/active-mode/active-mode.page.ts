import {Component, OnInit} from '@angular/core';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {NfcService} from '@app/services/nfc.service';
import {NavService} from '@app/services/nav/nav.service';
import {StorageService} from '@app/services/storage/storage.service';
import {SftpServices} from '@app/services/sftp.services';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {of, Subscription, timer, zip} from 'rxjs';
import {PagePath} from '@app/services/nav/page-path.enum';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SfpStatus} from '@app/services/storage/sftp-status.enum';
import {mergeMap} from 'rxjs/operators';
import {WindowService} from '@app/services/window.service';

@Component({
    selector: 'app-active-mode',
    templateUrl: './active-mode.page.html',
    styleUrls: ['./active-mode.page.scss'],
})
export class ActiveModePage implements ViewWillEnter, ViewWillLeave, OnInit {

    public headerMode: HeaderMode = HeaderMode.ACCOUNT_CREATION_PAGE;
    public footerMode: FooterMode = FooterMode.ACTIVE_MODE;
    public isPortraitMode: boolean;

    public username: string;
    public currentDatetime: string;
    public nextSyncDatetime: string;
    public lastSyncDatetime: string;
    public currentSftpStatus: SfpStatus = SfpStatus.NOT_SET;

    public readonly sftpStatusEnum = SfpStatus;

    private isSftpSetup: boolean;
    private nfcSubscription: Subscription;
    private windowSizeSubscription: Subscription;
    private storageGetterSubscription: Subscription;
    private timerSubscription: Subscription;

    public constructor(private nfcService: NfcService,
                       private navService: NavService,
                       private storageService: StorageService,
                       private sftpService: SftpServices,
                       private sqliteService: SQLiteService,
                       private windowService: WindowService) {
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
    }

    public ionViewWillLeave(): void {
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
    }

    public initPage(): void {
        this.isPortraitMode = this.windowService.isPortraitMode();

        this.timerSubscription = timer(0, 1000).subscribe(() => {
            this.currentDatetime = new Date().toISOString();
        });

        this.windowSizeSubscription = this.windowService.getWindowResizedObservable().subscribe(() => {
            this.isPortraitMode = this.windowService.isPortraitMode();
            console.log('tourne', this.isPortraitMode);
        });

        this.storageGetterSubscription = zip(this.storageService.getValue(StorageKeyEnum.ADMIN_USERNAME),
            this.storageService.getValue(StorageKeyEnum.SFTP_SETUP),
            this.storageService.getValue(StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME),
            this.storageService.getValue(StorageKeyEnum.LAST_SYNCHRONISATION_DATETIME))
            .pipe(mergeMap(([adminUsername, isSftpSetup, nextSync, lastSync]) => {
                this.username = adminUsername;
                this.isSftpSetup = Number(isSftpSetup) === 1;

                this.nextSyncDatetime = nextSync;
                this.lastSyncDatetime = lastSync;

                if (this.isSftpSetup) {
                    return this.sftpService.testConnection();
                }
                this.currentSftpStatus = SfpStatus.NOT_SET;
                return of(null);
            })).subscribe((isConnected) => {
                if (isConnected != null) {
                    this.currentSftpStatus = isConnected ? this.sftpStatusEnum.READY : this.sftpStatusEnum.ERROR;
                }
            });

        this.nfcSubscription = this.nfcService.nfcTags$.subscribe(
            (data) => this.sqliteService.registerClocking(this.nfcService.convertIdToHex(data)));
    }

}
