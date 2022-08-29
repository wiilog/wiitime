import {Injectable} from '@angular/core';
import {from, Observable, of, ReplaySubject, Subject, zip} from 'rxjs';
import {map, mergeMap, take, tap} from 'rxjs/operators';
import {SQLite, SQLiteObject} from '@awesome-cordova-plugins/sqlite/ngx';
import {Platform} from '@ionic/angular';
import {TABLES_DEFINITION} from '@app/services/sqlite/table-definitions';
import {TableName} from '@app/services/sqlite/table-name';
import {Entity} from '@app/services/sqlite/entities/entity';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';

@Injectable({
    providedIn: 'root'
})
export class SQLiteService {

    private static readonly DB_NAME: string = 'wiitime.db';

    private sqliteObject$: Subject<SQLiteObject>;

    public constructor(private sqlite: SQLite,
                       private platform: Platform,
                       private storageService: StorageService) {
        this.sqliteObject$ = new ReplaySubject<SQLiteObject>(1);
    }

    private get db$(): Observable<SQLiteObject> {
        return this.sqliteObject$.pipe(take(1));
    }

    public static resetDatabase(sqliteObject: SQLiteObject): Observable<any> {
        return SQLiteService.dropTables(sqliteObject)
            .pipe(
                mergeMap(() => SQLiteService.createTables(sqliteObject)),
                map(() => undefined),
                take(1)
            );
    }

    public static executeQueryStatic(db: SQLiteObject, query: string, params: Array<any> = []) {
        return from(db.executeSql(query, params));
    }

    private static executeQueryFlatMap(db: SQLiteObject, queries: Array<string>): Observable<void> {
        const [firstQuery, ...remainingQueries] = queries;
        return firstQuery
            ? SQLiteService.executeQueryStatic(db, firstQuery).pipe(mergeMap(() => SQLiteService.executeQueryFlatMap(db, remainingQueries)))
            : of(undefined);
    }

    private static createTables(db: SQLiteObject): Observable<any> {
        const createDatabaseRequests = TABLES_DEFINITION.map(({name, attributes}) => {
            const attributesStr = Object
                .keys(attributes)
                .map((attr) => (`\`${attr}\` ${attributes[attr]}`))
                .join(', ');
            return `CREATE TABLE IF NOT EXISTS \`${name}\`
                    (
                        ${attributesStr}
                    )`;
        });
        return SQLiteService.executeQueryFlatMap(db, createDatabaseRequests);
    }

    private static dropTables(db: SQLiteObject): Observable<any> {
        const dropDatabaseRequests = TABLES_DEFINITION
            .map(({name}) => `DROP TABLE IF EXISTS \`${name}\`;`);
        return SQLiteService.executeQueryFlatMap(db, dropDatabaseRequests);
    }

    private static multiSelectQueryMapper<T = any>(resQuery): Array<T> {
        const list = [];
        if (resQuery && resQuery.rows) {
            for (let i = 0; i < resQuery.rows.length; i++) {
                list.push(resQuery.rows.item(i));
            }
        }
        return list;
    }

    // only use this function once platform.ready is true
    public async initialiseDatabase(requireCreation: boolean): Promise<void> {
        if (requireCreation) {
            await this.createDatabase();
        } else {
            await this.openDatabase();
        }
    }

    public createDatabase(): void {
        // We wait sqlite plugin loading and we create the database
        from(this.sqlite.create({name: SQLiteService.DB_NAME, location: 'default'}))
            .pipe(
                mergeMap((sqliteObject: SQLiteObject) => SQLiteService
                    .resetDatabase(sqliteObject)
                    .pipe(map(() => sqliteObject))
                )
            )
            .subscribe(
                (sqliteObject: SQLiteObject) => {
                    this.sqliteObject$.next(sqliteObject);
                },
                e => console.log(e)
            );
    }

    public openDatabase(): void {
        // We wait sqlite plugin loading and we create the database
        from(this.sqlite.create({name: SQLiteService.DB_NAME, location: 'default'}))
            .pipe(
                mergeMap((sqliteObject: SQLiteObject) => SQLiteService
                    .createTables(sqliteObject)
                    .pipe(map(() => sqliteObject)))
            )
            .subscribe(
                (sqliteObject: SQLiteObject) => {
                    this.sqliteObject$.next(sqliteObject);
                },
                e => console.log(e)
            );
    }

    public resetDatabase(): Observable<any> {
        return zip(...TABLES_DEFINITION.map(({name}) => this.resetTable(name)));
    }

    public executeQuery(query: string, params: Array<string> = []): Observable<any> {
        return this.db$.pipe(
            mergeMap((db) => SQLiteService.executeQueryStatic(db, query, params)),
            map((res) => SQLiteService.multiSelectQueryMapper(res)),
            tap(
                () => {
                },
                (error) => {
                    console.error(query, params, error);
                }
            )
        );
    }

    public dropTable(table: TableName): Observable<any> {
        return this.executeQuery(`DROP TABLE IF EXISTS \`${table}\`;`);
    }

    public createTable(table: TableName): Observable<any> {
        const {attributes} = TABLES_DEFINITION.find(({name}) => name === table);

        const attributesStr = Object
            .keys(attributes)
            .map((attr) => (`\`${attr}\` ${attributes[attr]}`))
            .join(', ');
        return this.executeQuery(`CREATE TABLE IF NOT EXISTS \`${table}\`
                                  (
                                      ${attributesStr}
                                  )`);
    }

    public resetTable(table: TableName): Observable<any> {
        return this.dropTable(table).pipe(mergeMap(() => this.createTable(table)));
    }

    public get<T extends Entity>(table: TableName, search: { [key: string]: any } = {}): Observable<Array<T>> {
        let query = `SELECT *
                     FROM ${table}`;

        const values = [];

        if (search) {
            query += ` WHERE 1=1`;
            for (const [field, value] of Object.entries(search)) {
                query += ` AND ${field} LIKE ?`;
                values.push(value);
            }
        }

        return this.executeQuery(query, values);
    }

    public async insert<T extends Entity>(table: TableName, data: T | Array<T>, empty = false): Promise<void> {
        if (!Array.isArray(data)) {
            data = [data];
        }

        if (empty) {
            await this.executeQuery(`DELETE
                                     FROM ${table}`).toPromise();
        }

        const tableDefinition = TABLES_DEFINITION.find(({name}) => name === table);
        const columns = Object.keys(tableDefinition.attributes);

        for (const item of data) {
            const commaColumns = columns.join(`,`);
            const questionMarks = columns.map(_ => `?`).join(`,`);

            const values = Object.entries(item)
                .filter(([key, _]) => columns.indexOf(key) !== -1)
                .sort(([k1], [k2]) => columns.indexOf(k1) - columns.indexOf(k2))
                .map(([_, value]) => value);

            await this.executeQuery(`INSERT INTO ${table}(${commaColumns})
                                     VALUES (${questionMarks})`, values).toPromise();
        }
    }

    public deleteOldClocking(): Observable<void> {
        const table = TableName.CLOCKING_RECORD;
        return this.storageService.getValue(StorageKeyEnum.CLOCKING_STORAGE_DURATION)
            .pipe(
                mergeMap((storageDuration: string) => from(
                    this.executeQuery(`DELETE
                                       FROM ${table}
                                       WHERE DATETIME(clocking_date, '+${storageDuration} day') < DATETIME('now')`))
                ));
    }

    public updateClockingSynchronisation(resultIds: Array<number>): Observable<any> {
        return this.executeQuery(`UPDATE ${TableName.CLOCKING_RECORD}
                                  SET is_synchronised = 1
                                  WHERE id in (${resultIds})`);
    }

    public registerClocking(badgeId: string): void {
        from(this.insert(TableName.CLOCKING_RECORD, {
            id: null,
            badge_number: badgeId,
            clocking_date: new Date().toISOString(),
            is_synchronised: '0'
        })).pipe(mergeMap(() => this.deleteOldClocking()))
            .subscribe(() => console.log('clocking registered'));
    }
}
