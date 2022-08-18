import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {NFC, NfcTag} from '@ionic-native/nfc/ngx';
import {mergeMap, tap} from 'rxjs/operators';
import {TableName} from '@app/services/sqlite/table-name';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';

@Injectable({
    providedIn: 'root'
})
export class NfcService {

    public constructor(private nfc: NFC,) {}

    public get nfcTags$(): Observable<NfcTag> {
        const flags = this.nfc.FLAG_READER_NFC_A
            | this.nfc.FLAG_READER_NFC_V
            | this.nfc.FLAG_READER_NFC_B
            | this.nfc.FLAG_READER_NFC_F
            | this.nfc.FLAG_READER_NO_PLATFORM_SOUNDS;

        return from(this.nfc.enabled())
            .pipe(
                tap(
                    () => { console.log('nfc activated');},
                    () => {
                        console.error('NFC is not enable on this device : activate it if your want the app to work properly');
                    }
                ),
                mergeMap(() => this.nfc.readerMode(flags))
            );
    }

    public convertIdToHex(scannedTag: NfcTag): string {
        return this.nfc.bytesToHexString(scannedTag.id);
    }

    public openParameters(): Observable<void> {
        return from(this.nfc.showSettings());
    }
}
