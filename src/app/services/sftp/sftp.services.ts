import {Injectable} from '@angular/core';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {TableName} from '@app/services/sqlite/table-name';
import {iif, from, Observable, of, zip} from 'rxjs';
import {catchError, filter, map, mergeMap} from 'rxjs/operators';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {FileService} from '@app/services/file.service';
import {SftpConfig} from '@app/services/sftp/sftp-config';
import {WriteFileResult} from '@capacitor/filesystem';
import {Sftp} from '../../../plugins/sftp';

@Injectable({
    providedIn: 'root'
})
export class SftpServices {

    public constructor(private sqliteService: SQLiteService,
                       private storageService: StorageService,
                       private fileService: FileService) {
    }

    public testConnection(): Observable<boolean> {
        let connectionSuccess: boolean;
        return this.generateSftpConfig()
            .pipe(
                mergeMap((sftpConfig: SftpConfig) =>
                    from(
                        Sftp.connect(
                            {
                                hostname: sftpConfig.serverAddress,
                                port: `${sftpConfig.serverPort}`,
                                username: sftpConfig.serverUsername,
                                password: sftpConfig.serverPassword
                            })
                    )
                ),
                mergeMap((connectionResult) => {
                    connectionSuccess = connectionResult.success;
                    return from(Sftp.disconnect());
                }),
                map(() =>
                    connectionSuccess
                ),
                catchError((err) => {
                    console.error(err);
                    return from(Sftp.disconnect()).pipe(mergeMap(() => of(false)));
                })
            );
    }

    public testConnectionWithFile(testConfig?: SftpConfig): Observable<boolean> {
        let connectionSuccess: boolean;
        let filename: string;
        let usedConfig: SftpConfig;
        return iif(() => testConfig !== undefined,
            of(testConfig),
            this.generateSftpConfig()
        ).pipe(
            mergeMap((config) => {
                usedConfig = config;
                return this.fileService.getSFTPDataExportFileName();
            }),
            mergeMap((dataExportFilename) => {
                filename = dataExportFilename;
                return from(
                    Sftp.connect(
                        {
                            hostname: usedConfig.serverAddress,
                            port: `${usedConfig.serverPort}`,
                            username: usedConfig.serverUsername,
                            password: usedConfig.serverPassword
                        })
                );
            }),
            mergeMap((connectionResult) => {
                connectionSuccess = connectionResult.success;
                return this.fileService.writeFile(filename, null, null, true);
            }),
            mergeMap((writeFileResult: WriteFileResult) =>
                this.uploadFileToServer(writeFileResult.uri, usedConfig.remoteSavePath, filename)
            ),
            mergeMap(() =>
                from(Sftp.disconnect())
            ),
            map(() => connectionSuccess),
            catchError((err) => {
                console.error(err);
                return from(Sftp.disconnect()).pipe(map(() => err));
            }));
    }

    public synchronizeClocking(): Observable<boolean> {
        let fileName: string;
        const resultIds = new Array<number>();
        let sftpSaveFolderPath;
        return this.generateSftpConfig()
            .pipe(
                mergeMap((sftpConfig: SftpConfig) => {
                    sftpSaveFolderPath = sftpConfig.remoteSavePath;
                    return from(
                        Sftp.connect(
                            {
                                hostname: sftpConfig.serverAddress,
                                port: `${sftpConfig.serverPort}`,
                                username: sftpConfig.serverUsername,
                                password: sftpConfig.serverPassword
                            })
                    );
                }),
                mergeMap(() =>
                    zip(this.sqliteService.get<ClockingRecord>(TableName.CLOCKING_RECORD, {is_synchronised: '0'}),
                        this.fileService.getSFTPDataExportFileName())
                ),
                mergeMap(([clockingRecords, dataExportFilename]: [ClockingRecord[], string]) => {
                    fileName = dataExportFilename;
                    return this.fileService.writeFile(fileName, clockingRecords, resultIds, true);
                }),
                mergeMap((writeFileResult) =>
                    this.uploadFileToServer(writeFileResult.uri, sftpSaveFolderPath, fileName)
                ),
                filter((uploadResult) =>
                    uploadResult.success === true
                ),
                mergeMap(() =>
                    this.sqliteService.updateClockingSynchronisation(resultIds)
                ),
                mergeMap(() =>
                    from(Sftp.disconnect())
                ),
                map((disconnectResult) =>
                    disconnectResult.success
                ),
                catchError((err) => {
                    console.error(err);
                    return from(Sftp.disconnect()).pipe(mergeMap(() => of(false)));
                })
            );
    }

    private generateSftpConfig(): Observable<SftpConfig> {
        return zip(
            this.storageService.getValue(StorageKeyEnum.SFTP_SERVER_ADDRESS),
            this.storageService.getValue(StorageKeyEnum.SFTP_PORT),
            this.storageService.getValue(StorageKeyEnum.SFTP_USERNAME),
            this.storageService.getValue(StorageKeyEnum.SFTP_PASSWORD),
            this.storageService.getValue(StorageKeyEnum.SFTP_SAVE_PATH),
        ).pipe(
            mergeMap(([sftpAddress,
                          sftpPort,
                          sftpUsername,
                          sftpPassword,
                          sftpSavePath,]) => {
                const config = {
                    serverAddress: sftpAddress,
                    serverPort: Number(sftpPort),
                    serverUsername: sftpUsername,
                    serverPassword: sftpPassword,
                    remoteSavePath: sftpSavePath,
                };
                return of(config);
            }),
        );
    }

    private uploadFileToServer(localPath: string, sftpSavePath: string, fileName: string): Observable<any> {
        let remotePath = sftpSavePath + '/' + fileName;
        if (sftpSavePath.endsWith('/')) {
            remotePath = sftpSavePath + fileName;
        }
        return from(Sftp.upload({localFile: localPath, remoteFile: remotePath}));
    }
}
