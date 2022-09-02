import {Injectable} from '@angular/core';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {from, Observable, Subject} from 'rxjs';
import {Directory, Encoding, Filesystem, WriteFileResult} from '@capacitor/filesystem';
import {map, mergeMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {DateService} from '@app/services/date.service';
import {Device, DeviceId} from '@capacitor/device';

@Injectable({
    providedIn: 'root'
})
export class FileService {
    private readonly csvSeparator = ';';

    private readonly baseFilename = 'cpointagebrut_';

    private readonly fileHeader = 'TABLE=CPOINTAGEBRUT\n' +
        'SEPARATOR=;\n' +
        'COLUMNS=MCLI' + this.csvSeparator + 'MITEM' + this.csvSeparator +
        'MTIME' + this.csvSeparator + 'MTYPE' + this.csvSeparator + 'MSTATE\n';

    private readonly MCLI = 'Y022';
    private readonly MTYPE = '$import';
    private readonly MSTATE = '$pre';

    public constructor(private http: HttpClient,
                       private dateService: DateService) {

    }

    public getDataExportFileName(): Observable<string> {
        return from(Device.getId())
            .pipe(
                map((deviceId: DeviceId) => (
                        `${deviceId.uuid}_${this.baseFilename}${this.dateService.utfDatetimeToLocalString(new Date(), false)}.txt`
                    )
                )
            );
    }

    public writeFile(filename: string, clockingRecords: ClockingRecord[], resultIds: Array<number>): Observable<WriteFileResult> {
        let fileContent = this.fileHeader;
        if (clockingRecords) {
            clockingRecords.forEach((value) => {
                resultIds.push(value.id);
                fileContent = fileContent + this.MCLI + this.csvSeparator +
                    value.badge_number + this.csvSeparator +
                    this.dateService.utfDatetimeToLocalString(new Date(value.clocking_date), true) +
                    this.csvSeparator + this.MTYPE + this.csvSeparator + this.MSTATE + '\n';
            });
        }
        return from(Filesystem.writeFile({
            path: filename,
            data: fileContent,
            directory: Directory.Cache,
            encoding: Encoding.ASCII,
        }));
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
}
