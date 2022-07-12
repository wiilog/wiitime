import {Injectable} from '@angular/core';
import {GetResult, Storage} from '@capacitor/storage';
import {from, Observable, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SfpStatus} from '@app/services/storage/sftp-status.enum';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    // @ts-ignore
    private defaultParamValue = {
        [StorageKeyEnum.ADMIN_PASSWORD]: null,
        [StorageKeyEnum.ADMIN_USERNAME]: null,
        [StorageKeyEnum.IS_BACKGROUND_MODE_ACTIVE]: '0',
        [StorageKeyEnum.LOGO_PATH]: null,
        [StorageKeyEnum.KIOSK_MODE_MODAL_DURATION]: '3', //seconds
        [StorageKeyEnum.KIOSK_MODE_MESSAGE]: 'oui',
        [StorageKeyEnum.KIOSK_MODE_COMMUNICATION]: 'oui',
        [StorageKeyEnum.CLOCKING_SOUND_VOLUME]: '100', //percentage
        [StorageKeyEnum.CLOCKING_STORAGE_DURATION]: '7', //days
        [StorageKeyEnum.CLOCKING_DISPLAY_DURATION]: '12', //hours
        [StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING]: '2', //minutes
        [StorageKeyEnum.SFTP_SERVER_NAME]: null,
        [StorageKeyEnum.SFTP_PORT]: null,
        [StorageKeyEnum.SFTP_USERNAME]: null,
        [StorageKeyEnum.SFTP_PASSWORD]: null,
        [StorageKeyEnum.SFTP_SAVE_PATH]: null,
        [StorageKeyEnum.SYNCHRONISATION_FREQUENCY]: '12', //hours
        [StorageKeyEnum.SYNCHRONISATION_BEGIN_TIME]: '13:30', //TIME
        [StorageKeyEnum.LAST_SYNCHRONISATION_DATETIME]: null, //Date
        [StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME]: null, //Datetime
        [StorageKeyEnum.LAST_SFTP_STATUS]: SfpStatus.OFFLINE
    };

    public initStorage(): Observable<void> {
        return zip(...Object.keys(StorageKeyEnum).map((key: string) => {
            const elem: StorageKeyEnum = StorageKeyEnum[key];
            return this.setValue(elem, this.defaultParamValue[elem]);
        }))
            .pipe(map(() => undefined));
    }

    public setValue(key: StorageKeyEnum, value: any): Observable<void> {
        return from(Storage.set({key, value}));
    }

    public getValue(key: StorageKeyEnum): Observable<string | null> {
        return from(Storage.get({key}))
            .pipe(
                map(({value}) => value)
            );
    }
}
