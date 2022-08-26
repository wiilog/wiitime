import {Injectable} from '@angular/core';
import {SftpServices} from '@app/services/sftp.services';
import {StorageService} from '@app/services/storage/storage.service';
import {Observable, of, Subscription, timer, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {mergeMap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class BackgroundTaskService {

    private intervalDuration = 60;
    private clockingSyncSubscription: Subscription;

    public constructor(private sftpService: SftpServices,
                       private storageService: StorageService) {
    }

    public isSyncLoopRunning(): boolean {
        return this.clockingSyncSubscription != null;
    }

    public startSynchronisationLoop(): Observable<boolean> {
        return this.storageService.getValue(StorageKeyEnum.SFTP_SETUP).pipe(
            mergeMap((sftpIsSetup: string) => {
                if (!Number(sftpIsSetup)) {
                    console.log('sftp not setup, not starting sync loop');
                    return of(false);
                }
                this.clockingSyncSubscription = timer(100,this.intervalDuration * 1000)
                    .subscribe(() => {
                        this.synchronizeClockingIfRequired();
                    });
                console.log('sftp setup, started sync loop');
                return of(true);
            }),
        );
    }

    private synchronizeClockingIfRequired(): void {
        let currentSyncFrequency: number;
        zip(this.storageService.getValue(StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME),
            this.storageService.getValue(StorageKeyEnum.SYNCHRONISATION_FREQUENCY)).pipe(
            mergeMap(([nextSyncTime, syncFrequency]) => {
                currentSyncFrequency = Number(syncFrequency);
                if (new Date().toISOString() >= new Date(nextSyncTime).toISOString()) {
                    return this.sftpService.synchronizeClocking();
                }
                return of(false);
            }), mergeMap((syncResult) => {
                if (!syncResult) {
                    return of(null);
                }
                const newNextSynchro = new Date();
                const newLastSynchro = new Date(newNextSynchro);
                newNextSynchro.setMinutes(currentSyncFrequency * 60 + newNextSynchro.getMinutes());
                return this.storageService.updateStorageAfterSync(newLastSynchro, newNextSynchro);
            })
        ).subscribe(() => console.log('synchronisation loop completed'));
    }
}
