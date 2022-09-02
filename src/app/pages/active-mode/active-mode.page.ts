import {Component, OnInit} from '@angular/core';
import {ModalController, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {NfcService} from '@app/services/nfc.service';
import {NavService} from '@app/services/nav/nav.service';
import {StorageService} from '@app/services/storage/storage.service';
import {SftpServices} from '@app/services/sftp.services';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {of, timer, zip} from 'rxjs';
import {PagePath} from '@app/services/nav/page-path.enum';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SfpStatus} from '@app/services/storage/sftp-status.enum';
import {mergeMap} from 'rxjs/operators';
import {WindowService} from '@app/services/window.service';
import {ClockingInfoModalModeEnum} from '@app/modals/clocking-info-modal/clocking-info-modal-mode.enum';
import {ModePagePage} from '@app/pages/mode-page.page';

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

    public readonly sftpStatusEnum = SfpStatus;

    private isSftpSetup: boolean;

    public constructor(protected nfcService: NfcService,
                       private navService: NavService,
                       protected storageService: StorageService,
                       private sftpService: SftpServices,
                       protected sqliteService: SQLiteService,
                       protected windowService: WindowService,
                       protected modalCtrl: ModalController) {
        super(nfcService,
            storageService,
            sqliteService,
            windowService,
            modalCtrl);
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
        this.leaveModePage();
    }

    public initPage(): void {
        this.enterModePage();

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
            (data) => this.manageClocking(data.id, ClockingInfoModalModeEnum.ACTIVE_MODE));
    }
}
