import {Injectable} from '@angular/core';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';
import {TableName} from '@app/services/sqlite/table-name';

@Injectable({
    providedIn: 'root'
})
export class SftpServices {

    public constructor(private sqliteService: SQLiteService) {
    }

    //TODO all stuff linked to connecting to server

    public synchronizeClocking(): void {
        this.sqliteService.get<ClockingRecord>(TableName.CLOCKING_RECORD, {is_synchronised: '0'})
            .subscribe((results) => {
                const resultIds = new Array<number>();
                results.forEach((value) => {
                   resultIds.push(value.id);
                });
                //TODO generate file and send it and if success do update
                this.sqliteService.executeQuery(`UPDATE ${TableName.CLOCKING_RECORD} SET is_synchronised = '1'
                                 WHERE id in ${resultIds}`);
            });
    }
}
