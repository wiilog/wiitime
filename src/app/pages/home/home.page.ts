import {Component} from '@angular/core';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {NavService} from '@app/services/nav/nav.service';
import {NfcService} from '@app/services/nfc.service';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {TableName} from '@app/services/sqlite/table-name';
import {Subscription, zip} from 'rxjs';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';

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
                       private sqliteService: SQLiteService) {
    }

    public async ionViewWillEnter(): Promise<any> {
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

        this.nfcSubscription = this.nfcService.nfcTags$.subscribe(
            (data) => this.sqliteService.registerClocking(this.nfcService.convertIdToHex(data)));
    }

    public async ionViewWillLeave(): Promise<any> {
        this.insertExampleSub.unsubscribe();
        this.nfcSubscription.unsubscribe();

        if (this.dataSubscription && !this.dataSubscription.closed) {
            this.dataSubscription.unsubscribe();
            this.dataSubscription = undefined;
        }
    }

    public openNfcParameters(): void {
        this.nfcService.openParameters();
    }
}

//TODO delete all of this later

/* force to use right or left for button param
    public cry(mode: 'right' | 'left'): void {
        console.log('I am now crying :\'(');
    }

    import {tap} from 'rxjs/operators';
    tap(() => {
        this.storageService.getValue(StorageKeyEnum.ADMIN_USERNAME).subscribe((ff) => {console.log(typeof ff);});
    })
*/
