import {Injectable} from '@angular/core';
import {Preferences} from '@capacitor/preferences';
import {from, Observable, of, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SfpStatus} from '@app/services/storage/sftp-status.enum';
import {map, mergeMap} from 'rxjs/operators';
import {FileService} from '@app/services/file.service';
import {DateService} from '@app/services/date.service';
import {SftpSyncInfo} from '@app/services/sftp/sftp-sync-info';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private defaultLogoPath = '/assets/img/LogoGT.png';

    private defaultParamValue = {
        [StorageKeyEnum.ADMIN_PASSWORD]: null,
        [StorageKeyEnum.ADMIN_USERNAME]: null,
        [StorageKeyEnum.CURRENT_SECONDARY_MODE]: '0',
        [StorageKeyEnum.KIOSK_MODE_MODAL_DURATION]: '3', //seconds
        [StorageKeyEnum.KIOSK_MODE_MESSAGE]: 'oui',
        [StorageKeyEnum.KIOSK_MODE_COMMUNICATION]: 'non',
        [StorageKeyEnum.CLOCKING_SOUND_VOLUME]: '100', //percentage
        [StorageKeyEnum.CLOCKING_STORAGE_DURATION]: '7', //days
        [StorageKeyEnum.CLOCKING_DISPLAY_INTERVAL]: '12', //hour
        [StorageKeyEnum.CLOCKING_INFO_MODAL_DISPLAY_DURATION]: '12', //second
        [StorageKeyEnum.DELAY_BETWEEN_TWO_CLOCKING]: '2', //minutes
        [StorageKeyEnum.SFTP_SERVER_ADDRESS]: '',
        [StorageKeyEnum.SFTP_PORT]: '',
        [StorageKeyEnum.SFTP_USERNAME]: '',
        [StorageKeyEnum.SFTP_PASSWORD]: '',
        [StorageKeyEnum.SFTP_SAVE_PATH]: '',
        [StorageKeyEnum.SYNCHRONISATION_FREQUENCY]: '12', //hours
        [StorageKeyEnum.SYNCHRONISATION_BEGIN_DATETIME]: this.dateService.setDateTime(new Date(), 13, 30), //TIME
        [StorageKeyEnum.LAST_SYNCHRONISATION_DATETIME]: null, //Date
        [StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME]: null, //Datetime
        [StorageKeyEnum.LAST_SFTP_STATUS]: SfpStatus.NOT_SET,
        [StorageKeyEnum.SFTP_SETUP]: '0', //boolean
    };

    public constructor(private fileService: FileService,
                       private dateService: DateService) {
    }

    public initStorage(): Observable<void> {
        return this.fileService.getFileData(this.defaultLogoPath)
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

    public setValue(key: StorageKeyEnum, value: any): Observable<void> {
        return from(Preferences.set({key, value}));
    }

    public getValue(key: StorageKeyEnum): Observable<string | null> {
        return from(Preferences.get({key}))
            .pipe(
                map(({value}) => value)
            );
    }

    public updateSynchronisationValues(initBeginTime: Date,
                                       newBeginTime: string,
                                       initSyncFrequency: number,
                                       newSyncFrequency: number): Observable<any> {
        let pickedDate = this.dateService.setDateTime(new Date(initBeginTime),
            Number(newBeginTime.slice(0, 2)),
            Number(newBeginTime.substring(3)));
        let newNextSyncDatetime: Date;

        return this.getValue(StorageKeyEnum.LAST_SYNCHRONISATION_DATETIME)
            .pipe(
                mergeMap((lastSyncDatetime) => {
                    if (initSyncFrequency !== newSyncFrequency) {
                        if (lastSyncDatetime) {
                            if (initBeginTime <= new Date(lastSyncDatetime)) {
                                newNextSyncDatetime = new Date();
                                newNextSyncDatetime.setMinutes(60 * newSyncFrequency + newNextSyncDatetime.getMinutes());
                            }
                        } else {
                            newNextSyncDatetime = new Date();
                            newNextSyncDatetime.setMinutes(60 * newSyncFrequency + newNextSyncDatetime.getMinutes());
                        }
                    }
                    if (initBeginTime.toISOString() !== pickedDate.toISOString()) {
                        const now = new Date();
                        pickedDate = this.dateService.setDateTime(new Date(),
                            Number(newBeginTime.slice(0, 2)),
                            Number(newBeginTime.substring(3)));
                        if (now.getTime() > pickedDate.getTime()) {
                            pickedDate.setDate(pickedDate.getDate() + 1);
                        }
                        newNextSyncDatetime = pickedDate;
                    }
                    return zip(
                        this.setValue(StorageKeyEnum.SYNCHRONISATION_FREQUENCY, newSyncFrequency.toString()),
                        this.setValue(StorageKeyEnum.SYNCHRONISATION_BEGIN_DATETIME, pickedDate.toISOString()),
                        this.updateNextSyncValue(newNextSyncDatetime)
                    );
                }),
            );
    }

    public updateStorageAfterSync(newLastSyncDatetime: Date, newNextSyncDatetime: Date): Observable<SftpSyncInfo> {
        return zip(
            this.updateLastSyncValue(newLastSyncDatetime),
            this.updateNextSyncValue(newNextSyncDatetime)
        ).pipe(
            map(() => {
                return {
                    nextSyncDate: newNextSyncDatetime.toISOString(),
                    lastSyncDate: newLastSyncDatetime.toISOString()
                };
            })
        );
    }

    private updateLastSyncValue(newLastSyncDatetime): Observable<any> {
        if (newLastSyncDatetime) {
            console.log('last synchro was', newLastSyncDatetime.toString());
            return this.setValue(StorageKeyEnum.LAST_SYNCHRONISATION_DATETIME, newLastSyncDatetime.toISOString());
        }
        return of(null);
    }

    private updateNextSyncValue(newNextSyncDatetime: Date): Observable<any> {
        if (newNextSyncDatetime) {
            console.log('next synchro is', newNextSyncDatetime);
            return this.setValue(StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME, newNextSyncDatetime.toISOString());
        }
        return of(null);
    }
}
