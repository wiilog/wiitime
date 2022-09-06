import {Component} from '@angular/core';
import {ModalController, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {NavService} from '@app/services/nav/nav.service';
import {NfcService} from '@app/services/nfc.service';
import {StorageService} from '@app/services/storage/storage.service';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {Subscription} from 'rxjs';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {PagePath} from '@app/services/nav/page-path.enum';
import {SftpServices} from '@app/services/sftp.services';
import {PasswordCheckModalComponent} from '@app/modals/password-check-modal/password-check-modal.component';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewWillLeave {

    public headerMode: HeaderMode = HeaderMode.ACCOUNT_CREATION_PAGE;
    public footerMode: FooterMode = FooterMode.ACTIVE_MODE;

    private insertExampleSub: Subscription;
    private dataSubscription: Subscription;
    private nfcSubscription: Subscription;

    public constructor(private nfcService: NfcService,
                       private navService: NavService,
                       private storageService: StorageService,
                       private sftpService: SftpServices,
                       private modalCtrl: ModalController,
                       private sqliteService: SQLiteService) {
    }

    public async ionViewWillEnter(): Promise<any> {

        this.initPage();
        /*
        this.insertExampleSub = from(this.sqliteService.insert(TableName.CLOCKING_RECORD, {id: 5,
                                                            badge_number: '22222',
                                                            clocking_date: '2022-07-12 13:25:03',
                                                            is_synchronised: 0
        })).subscribe(() => console.log('test insert finished'));

        this.dataSubscription = zip(
            this.storageService.getValue(StorageKeyEnum.ADMIN_PASSWORD),
            this.storageService.getValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION),
        )
            .subscribe(([adminPassword, kioskModeCommunication]) => {
                console.log('adminPassword => ', adminPassword);
                console.log('kioskModeCommunication => ', kioskModeCommunication);
            });

        this.sqliteService.get<ClockingRecord>(TableName.CLOCKING_RECORD).subscribe((clockings: Array<ClockingRecord>) => {
            console.log(clockings);
        });
        */
    }

    public initPage(): void {
        this.nfcSubscription = this.nfcService.nfcTags$.subscribe(
            (data) => this.sqliteService.registerClocking(this.nfcService.convertIdToHex(data.id)));
    }

    public async ionViewWillLeave(): Promise<any> {
        //this.insertExampleSub.unsubscribe();
        if (this.nfcSubscription && !this.nfcSubscription.closed) {
            this.nfcSubscription.unsubscribe();
        }

        if (this.dataSubscription && !this.dataSubscription.closed) {
            this.dataSubscription.unsubscribe();
            this.dataSubscription = undefined;
        }
    }

    public async openNfcParameters(): Promise<void> {
        //Todo remove
        const modal = await this.modalCtrl.create({
            component: PasswordCheckModalComponent,
            keyboardClose: true,
            componentProps: {
                modalTitle: 'Accès au paramétrage',
            },
            cssClass: 'auto-height',
            backdropDismiss: false,
        });
        await modal.present();

        const {data, role} = await modal.onWillDismiss();
        if (role === 'confirm') {
            console.log(data);
        }
        //this.nfcService.openParameters();
    }
}

//TODO delete all of this later

/* force to use right or left for button param
    public cry(mode: 'right' | 'left'): void {
        console.log('I am now crying :\'(');
    }
*/
