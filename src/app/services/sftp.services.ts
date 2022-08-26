import {Injectable} from '@angular/core';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {TableName} from '@app/services/sqlite/table-name';
import {from, Observable, of, zip} from 'rxjs';
import {catchError, filter, mergeMap} from 'rxjs/operators';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {FTP} from '@awesome-cordova-plugins/ftp/ngx';
import {FileService} from '@app/services/file.service';
import {DateService} from '@app/services/date.service';

@Injectable({
    providedIn: 'root'
})
export class SftpServices {

    public constructor(private sqliteService: SQLiteService,
                       private storageService: StorageService,
                       private fileService: FileService,
                       private dateService: DateService,
                       private ftp: FTP) {

    }

    public testConnection(): Observable<boolean> {
        let connectionSuccess: boolean;
        return zip(this.storageService.getValue(StorageKeyEnum.SFTP_SERVER_ADDRESS),
            this.storageService.getValue(StorageKeyEnum.SFTP_PORT),
            this.storageService.getValue(StorageKeyEnum.SFTP_USERNAME),
            this.storageService.getValue(StorageKeyEnum.SFTP_PASSWORD),).pipe(
            mergeMap(([sftpAddress,
                          sftpPort,
                          sftpUsername,
                          sftpPassword,]) =>
                from(this.ftp.connect(sftpAddress.concat(':', sftpPort), sftpUsername, sftpPassword))
            ), mergeMap((connectionResult) => {
                connectionSuccess = connectionResult === 'OK';
                return from(this.ftp.disconnect());
            }), mergeMap(() => of(connectionSuccess)
            ), catchError((err) => {
                console.log(err);
                return from(this.ftp.disconnect()).pipe(mergeMap(() => of(false)));
            }));
    }

    public synchronizeClocking(): Observable<boolean> {
        //Todo update to return an observable boolean for success or failure
        const fileName = this.fileService.getBaseFilename()
            + this.dateService.utfDatetimeToLocalString(new Date(), false) + '.txt';
        const resultIds = new Array<number>();
        let sftpSaveFolderPath;
        return zip(this.storageService.getValue(StorageKeyEnum.SFTP_SERVER_ADDRESS),
            this.storageService.getValue(StorageKeyEnum.SFTP_PORT),
            this.storageService.getValue(StorageKeyEnum.SFTP_USERNAME),
            this.storageService.getValue(StorageKeyEnum.SFTP_PASSWORD),
            this.storageService.getValue(StorageKeyEnum.SFTP_SAVE_PATH)).pipe(
            mergeMap(([sftpAddress,
                          sftpPort,
                          sftpUsername,
                          sftpPassword,
                          sftpSavePath]) => {
                sftpSaveFolderPath = sftpSavePath;
                return from(this.ftp.connect(sftpAddress.concat(':', sftpPort), sftpUsername, sftpPassword));
            }),
            mergeMap(() =>
                this.sqliteService.get<ClockingRecord>(TableName.CLOCKING_RECORD, {is_synchronised: '0'})
            ),
            mergeMap((clockingRecords) =>
                this.fileService.writeFile(fileName, clockingRecords, resultIds)
            ), mergeMap((writeFileResult) =>
                this.uploadFileToServer(writeFileResult.uri, sftpSaveFolderPath, fileName)
            ), filter((uploadResult) =>
                uploadResult === 1
            ), mergeMap(() =>
                this.sqliteService.updateClockingSynchronisation(resultIds)
            ), mergeMap(() =>
                from(this.ftp.disconnect())
            ), mergeMap((disconnectResult) =>
                of(disconnectResult === 'OK')
            ),
            catchError((err) => {
                console.log(err);
                return from(this.ftp.disconnect()).pipe(mergeMap(() => of(false)));
            })
        );
    }

    private uploadFileToServer(localPath: string, sftpSavePath: string, fileName: string): Observable<any> {
        let remotePath = sftpSavePath + '/' + fileName;
        if (sftpSavePath.endsWith('/')) {
            remotePath = sftpSavePath + fileName;
        }
        return this.ftp.upload(localPath, remotePath);
    }
}
