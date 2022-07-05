import {Component} from '@angular/core';
import {NFC, Ndef, NfcTag} from '@ionic-native/nfc/ngx';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {Observable, Observer, Subscription} from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewWillLeave {
    private reader$: Subscription;

    public constructor(private nfc: NFC, private ndef: Ndef) {
    }

    public async activateReaderMode() {
        let isNfcEnable = true;
        try {
            await this.nfc.enabled();
        } catch (error) {
            isNfcEnable = false;
            console.log('NFC is not enable on this device : activate it if your want the app to work properly');
            console.log('NFC setting result : ', await this.nfc.showSettings());
        }
        if(!isNfcEnable) {
            //Todo modify to give the option to open the option tab and display message on page and not in console
            return;
        }
        console.log('NFC is enabled, let\'s go !');

        let flags = this.nfc.FLAG_READER_NFC_A | this.nfc.FLAG_READER_NFC_V | this.nfc.FLAG_READER_NFC_B | this.nfc.FLAG_READER_NFC_F;

        this.reader$ = this.nfc.readerMode(flags).subscribe(
                tag => console.log(tag),
                err => console.log('Error reading tag', err)
        );
    }

    public async ionViewWillEnter() {
        console.log('View will enter');
        await this.activateReaderMode();
    }

    public async ionViewWillLeave() {
        console.log('View will leave');
        this.reader$.unsubscribe();
    }
}

/*
        this.readerMode$ = this.nfc.readerMode(flags)
            .pipe(
            )
            .subscribe(
                tag => console.log(JSON.stringify(tag)),
                err => console.log('Error reading tag', err)
            );
*/
