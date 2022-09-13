import {Component} from '@angular/core';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {NfcService} from '@app/services/nfc.service';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewWillLeave {

    public headerMode: HeaderMode = HeaderMode.ACTIVE_MODE;
    public footerMode: FooterMode = FooterMode.KIOSK_MODE;

    public constructor(private nfcService: NfcService,) {
    }

    public async ionViewWillEnter(): Promise<any> {
    }

    public async ionViewWillLeave(): Promise<any> {
    }

    public async openNfcParameters(): Promise<void> {
        this.nfcService.openParameters();
    }
}
