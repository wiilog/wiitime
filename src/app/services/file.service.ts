import {Injectable} from '@angular/core';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {from, Observable, Subject} from 'rxjs';
import {Directory, Encoding, Filesystem, WriteFileResult} from '@capacitor/filesystem';
import {mergeMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

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

    public constructor(private http: HttpClient) {

    }

    public getBaseFilename(): string {
        return this.baseFilename;
    }

    public utfDatetimeToLocalString(date: Date, separator: boolean): string {
        let dateSeparator = '-';
        let timeSeparator = ':';
        let charBetweenTimeAndDate = ' ';

        if (!separator) {
            dateSeparator = '';
            timeSeparator = '';
            charBetweenTimeAndDate = '';
        }
        const month = date.getMonth() < 10 ? '0'.concat(date.getMonth().toString()) : date.getMonth();
        const day = date.getDay() < 10 ? '0'.concat(date.getDay().toString()) : date.getDay();
        const hour = date.getHours() < 10 ? '0'.concat(date.getHours().toString()) : date.getHours();
        const minute = date.getMinutes() < 10 ? '0'.concat(date.getMinutes().toString()) : date.getMinutes();
        const second = date.getSeconds() < 10 ? '0'.concat(date.getSeconds().toString()) : date.getSeconds();
        return date.getFullYear() + dateSeparator + month + dateSeparator + day + charBetweenTimeAndDate
            + hour + timeSeparator + minute + timeSeparator + second;
    }

    public writeFile(filename: string, clockingRecords: ClockingRecord[], resultIds: Array<number>): Observable<WriteFileResult> {
        let fileContent = this.fileHeader;
        clockingRecords.forEach((value) => {
            resultIds.push(value.id);
            fileContent = fileContent + this.csvSeparator + this.MCLI + this.csvSeparator +
                value.badge_number + this.csvSeparator +
                this.utfDatetimeToLocalString(new Date(value.clocking_date), true) +
                this.csvSeparator + this.MTYPE + this.csvSeparator + this.MSTATE + '\n';
        });
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
