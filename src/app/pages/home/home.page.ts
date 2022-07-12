import {Component} from '@angular/core';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {NavServices} from '@app/services/nav/nav.services';
import {NfcService} from '@app/services/nfc.service';
import {StorageService} from '@app/services/storage/storage-service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {TableName} from '@app/services/sqlite/table-name';
import {from} from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewWillLeave {

    public constructor(private nfcService: NfcService,
                       private navService: NavServices,
                       private storageService: StorageService,
                       private sqliteService: SQLiteService) {
    }

    public async ionViewWillEnter(): Promise<any> {
        from(this.sqliteService.insert(TableName.clocking, {id: 5,
                                                            badge_number: '22222',
                                                            clocking_date: '2022-07-12 13:25:03',
                                                            is_synchronised: 0
        })).subscribe(() => console.log('test insert finished'));
        this.sqliteService.get(TableName.clocking).then(elems => {
            elems.map(elem => console.log(elem));
        });
        this.storageService.getValue(StorageKeyEnum.ADMIN_PASSWORD).subscribe((oui: string|null) => console.log(oui));
        this.storageService.getValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION).subscribe((oui: string|null) => console.log(oui));
        // store les subscription pour les unsub en cas de changement de page
    }

    public async ionViewWillLeave(): Promise<any> {
    }

    public openNfcParameters(): void {
        this.nfcService.openParameters();
    }

    //Fonction call par l'event userClick
    public onButtonClicked(message: string): void {
        console.log(message);
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
