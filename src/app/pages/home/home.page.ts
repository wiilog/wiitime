import {Component} from '@angular/core';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {NavServices} from '@app/services/nav/nav.services';
import {NfcService} from '@app/services/nfc.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewWillLeave {

    public constructor(private nfcService: NfcService, private navService: NavServices) {
    }

    public async ionViewWillEnter(): Promise<any> {
    }

    public async ionViewWillLeave(): Promise<any> {
    }

    public openNfcParameters(): void {
        this.nfcService.openParameters();
    }
}

/* force to use right or left for button param
    public cry(mode: 'right' | 'left'): void {
        console.log('I am now crying :\'(');
    }
*/

/* Piece of home the where deleted
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>
      Je suis un lémurien des grande plaines gelée de l'alaska
    </ion-title>
  </ion-toolbar>
</ion-header>
 */
