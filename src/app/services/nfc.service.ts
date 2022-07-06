import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs';
import {NFC} from '@ionic-native/nfc/ngx';

@Injectable({
    providedIn:'root'
})
export class NfcService {
    private reader$: Subscription;

    public constructor(private nfc: NFC) {
    }

    public async openParameters(): Promise<void> {
        try {
            await this.nfc.showSettings();
        } catch (error) {
            console.error('could not open the device parameters');
        }
    }

    public async activateReaderMode(): Promise<boolean> {
        try {
            await this.nfc.enabled();
        } catch (error) {
            console.error('NFC is not enable on this device : activate it if your want the app to work properly');
            return false;
        }

        const flags = this.nfc.FLAG_READER_NFC_A | this.nfc.FLAG_READER_NFC_V | this.nfc.FLAG_READER_NFC_B | this.nfc.FLAG_READER_NFC_F;

        this.reader$ = this.nfc.readerMode(flags).subscribe(
            tag => console.log(tag),
            err => console.log('Error reading tag', err)
        );
        return true;
    }

    public deactivateReaderMode(): boolean {
        if(this.reader$.closed) {
            return false;
        }
        this.reader$.unsubscribe();
        return true;
    }
}
