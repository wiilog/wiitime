import {Injectable} from '@angular/core';
import {SftpServices} from '@app/services/sftp/sftp.services';
import {StorageService} from '@app/services/storage/storage.service';
import {Observable, of, Subject, Subscription, timer, zip} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {mergeMap} from 'rxjs/operators';
import {SftpSyncInfo} from '@app/services/sftp/sftp-sync-info';

@Injectable({
    providedIn: 'root'
})
export class BackgroundTaskService {

    public readonly syncCompleted$: Subject<SftpSyncInfo>;

    private intervalDuration = 60;
    private clockingSyncSubscription: Subscription;
    private syncMessageSubscription: Subscription;
    private lastNextSyncDatetime: Date;

    public constructor(private sftpService: SftpServices,
                       private storageService: StorageService) {
        this.syncCompleted$ = new Subject<any>();
    }

    public isSyncLoopRunning(): boolean {
        return this.clockingSyncSubscription != null;
    }

    public startSynchronisationLoop(): Observable<boolean> {
        return zip(this.storageService.getValue(StorageKeyEnum.SFTP_SETUP),
            this.storageService.getValue(StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME))
            .pipe(
                mergeMap(([sftpIsSetup, nextSync]) => {
                    if (!Number(sftpIsSetup)) {
                        console.log('sftp not setup, not starting sync loop');
                        return of(false);
                    }
                    const nextSyncDatetime = new Date(nextSync);
                    const now = new Date();
                    if (now.toISOString() >= nextSyncDatetime.toISOString()) {
                        this.lastNextSyncDatetime = nextSyncDatetime;
                        this.setClockingSyncSubscription(1);
                    } else {
                        this.lastNextSyncDatetime = nextSyncDatetime;
                        this.setClockingSyncSubscription(nextSyncDatetime);
                    }
                    console.log('sftp setup, started sync loop');
                    return of(true);
                }),
            );
    }

    public syncParametersHaveChanged(initBeginTime: Date,
                                     newBeginTime: string,
                                     initSyncFrequency: number,
                                     newSyncFrequency: number): Observable<any> {
        let storageNextSyncDatetime: Date;
        return this.storageService.updateSynchronisationValues(
            initBeginTime,
            newBeginTime,
            initSyncFrequency,
            newSyncFrequency
        ).pipe(
            mergeMap(() => this.storageService.getValue(StorageKeyEnum.NEXT_SYNCHRONISATION_DATETIME)),
            mergeMap((nextSync) => {
                storageNextSyncDatetime = new Date(nextSync);
                if (storageNextSyncDatetime.toISOString() !== this.lastNextSyncDatetime.toISOString()) {
                    this.lastNextSyncDatetime = storageNextSyncDatetime;
                    this.setClockingSyncSubscription(this.lastNextSyncDatetime);
                }
                return of(null);
            })
        );
    }

    private clearClockingSyncSubscription(): void {
        if (this.clockingSyncSubscription && !this.clockingSyncSubscription.closed) {
            this.clockingSyncSubscription.unsubscribe();
            this.clockingSyncSubscription = null;
        }
    }

    private setClockingSyncSubscription(timerValue: number | Date): void {
        this.clearClockingSyncSubscription();
        this.clockingSyncSubscription = timer(timerValue)
            .subscribe(() => {
                this.synchronizeClocking();
            });
    }

    private synchronizeClocking(): void {
        let currentSyncFrequency: number;
        this.syncMessageSubscription = this.storageService.getValue(StorageKeyEnum.SYNCHRONISATION_FREQUENCY).pipe(
            mergeMap((syncFrequency) => {
                currentSyncFrequency = Number(syncFrequency);
                return this.sftpService.synchronizeClocking();
            }), mergeMap((syncResult) => {
                if (!syncResult) {
                    console.log('sync failed, will try again in', this.intervalDuration, 'seconds');
                    this.setClockingSyncSubscription(this.intervalDuration * 1000);
                    return of(null);
                }
                const newNextSynchro = new Date();
                const newLastSynchro = new Date(newNextSynchro);
                newNextSynchro.setMinutes(currentSyncFrequency * 60 + newNextSynchro.getMinutes());
                this.setClockingSyncSubscription(newNextSynchro);
                this.lastNextSyncDatetime = newNextSynchro;
                return this.storageService.updateStorageAfterSync(newLastSynchro, newNextSynchro);
            })
        ).subscribe((newSyncInfo: SftpSyncInfo) => {
            console.log('synchronisation loop completed');
            if (newSyncInfo) {
                this.syncCompleted$.next(newSyncInfo);
            }
            if (this.syncMessageSubscription && !this.syncMessageSubscription.closed) {
                this.syncMessageSubscription.unsubscribe();
                this.syncMessageSubscription = null;
            }
        });
    }
}
