import {Injectable} from '@angular/core';
import {Preferences} from '@capacitor/preferences';
import {from, Observable, Subject, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SfpStatus} from '@app/services/storage/sftp-status.enum';
import {map, mergeMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private defaultLogoPath = '/assets/img/LogoGT.png';

    private defaultParamValue = {
        [StorageKeyEnum.ADMIN_PASSWORD]: null,
        [StorageKeyEnum.ADMIN_USERNAME]: null,
        [StorageKeyEnum.CURRENT_SECONDARY_MODE]: '1',
        [StorageKeyEnum.KIOSK_MODE_MODAL_DURATION]: '3', //seconds
        [StorageKeyEnum.KIOSK_MODE_MESSAGE]: 'oui',
        [StorageKeyEnum.KIOSK_MODE_COMMUNICATION]: 'non',
        [StorageKeyEnum.CLOCKING_SOUND_VOLUME]: '100', //percentage
        [StorageKeyEnum.CLOCKING_STORAGE_DURATION]: '7', //days
        [StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL]: '12', //hour
        [StorageKeyEnum.CLOCKING_POPUP_DISPLAY_DURATION]: '12', //second
        [StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING]: '2', //minutes
        [StorageKeyEnum.SFTP_SERVER_ADDRESS]: '',
        [StorageKeyEnum.SFTP_PORT]: '',
        [StorageKeyEnum.SFTP_USERNAME]: '',
        [StorageKeyEnum.SFTP_PASSWORD]: '',
        [StorageKeyEnum.SFTP_SAVE_PATH]: '',
        [StorageKeyEnum.SYNCHRONISATION_FREQUENCY]: '12', //hours
        [StorageKeyEnum.SYNCHRONISATION_BEGIN_TIME]: '13:30', //TIME
        [StorageKeyEnum.LAST_SYNCHRONISATION_DATETIME]: null, //Date
        [StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME]: null, //Datetime
        [StorageKeyEnum.LAST_SFTP_STATUS]: SfpStatus.OFFLINE,
        [StorageKeyEnum.SFTP_SETUP]: '0', //boolean
    };

    public constructor(private http: HttpClient) {
    }

    public initStorage(): Observable<void> {
        return this.getFileData(this.defaultLogoPath)
            .pipe(
                mergeMap((base64Logo) => (
                    zip(
                        ...Object.keys(StorageKeyEnum).map((key: string) => {
                            const elem: StorageKeyEnum = StorageKeyEnum[key];
                            return this.setValue(elem, this.defaultParamValue[elem]);
                        }),
                        this.setValue(StorageKeyEnum.LOGO, base64Logo)
                    )
                )),
                map(() => undefined)
        );
    }

    public getFileData(path: string): Observable<string> {
        return this.http.get(path, {responseType: 'blob'})
            .pipe(
                mergeMap((res) => {
                    const base64$ = new Subject<string>();
                    const reader = new FileReader();
                    reader.readAsDataURL(res);
                    reader.onloadend = () => {
                        base64$.next(reader.result.toString());
                    };
                    return base64$;
                }),
            );
    }

    public setValue(key: StorageKeyEnum, value: any): Observable<void> {
        return from(Preferences.set({key, value}));
    }

    public getValue(key: StorageKeyEnum): Observable<string | null> {
        return from(Preferences.get({key}))
            .pipe(
                map(({value}) => value)
            );
    }
}
