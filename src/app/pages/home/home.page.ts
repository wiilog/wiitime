import {Component} from '@angular/core';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {NavService} from '@app/services/nav/nav.service';
import {NfcService} from '@app/services/nfc.service';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {TableName} from '@app/services/sqlite/table-name';
import {from, Subscription} from 'rxjs';
import {HeaderMode} from '@app/components/header/header-mode.enum';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewWillLeave {

    public headerMode: HeaderMode = HeaderMode.ACCOUNT_CREATION_PAGE;

    private insertExampleSub: Subscription;
    private getAdminPasswordSub: Subscription;
    private getKioskModeCommunicationSub: Subscription;

    public constructor(private nfcService: NfcService,
                       private navService: NavService,
                       private storageService: StorageService,
                       private sqliteService: SQLiteService) {
    }

    public async ionViewWillEnter(): Promise<any> {
        this.insertExampleSub = from(this.sqliteService.insert(TableName.clocking, {id: 5,
                                                            badge_number: '22222',
                                                            clocking_date: '2022-07-12 13:25:03',
                                                            is_synchronised: 0
        })).subscribe(() => console.log('test insert finished'));
        this.sqliteService.get(TableName.clocking).then(elems => {
            elems.map(elem => console.log(elem));
        });
        this.getAdminPasswordSub = this.storageService.getValue(StorageKeyEnum.ADMIN_PASSWORD)
            .subscribe((oui: string|null) => console.log(oui));
        this.getKioskModeCommunicationSub = this.storageService.getValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION)
            .subscribe((oui: string|null) => console.log(oui));
    }

    public async ionViewWillLeave(): Promise<any> {
        this.insertExampleSub.unsubscribe();
        this.getAdminPasswordSub.unsubscribe();
        this.getKioskModeCommunicationSub.unsubscribe();
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

/* Piece of home whichS where deleted
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>
      Je suis un lémurien des grande plaines gelée de l'alaska
    </ion-title>
  </ion-toolbar>
</ion-header>
 */
