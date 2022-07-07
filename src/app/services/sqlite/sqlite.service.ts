import {Injectable} from '@angular/core';
import {from, Observable, of, ReplaySubject, Subject, zip} from 'rxjs';
import {mergeMap, map, take, tap} from 'rxjs/operators';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {Platform} from '@ionic/angular';
import {TABLES_DEFINITION} from '@app/services/sqlite/table-definitions';
import {TableName} from '@app/services/sqlite/table-name';

@Injectable({
    providedIn: 'root'
})

export class SQLiteService {

    private sqliteObject$: Subject<SQLiteObject>;

    public constructor(private sqlite: SQLite,
                       private platform: Platform) {
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
            return `CREATE TABLE IF NOT EXISTS \`${name}\` (${attributesStr})`;
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

    public createDatabase(dbName: string): void {
        // We wait sqlite plugin loading and we create the database
        from(this.platform.ready())
            .pipe(
                mergeMap(() => this.sqlite.create({name: dbName, location: 'default'})),
                mergeMap((sqliteObject: SQLiteObject) => SQLiteService
                    .resetDatabase(sqliteObject)
                    .pipe(map(() => sqliteObject)))
            )
            .subscribe(
                (sqliteObject: SQLiteObject) => {
                    this.sqliteObject$.next(sqliteObject);
                },
                e => console.log(e)
            );
    }

    public openDatabase(dbName: string): void {
        // We wait sqlite plugin loading and we create the database
        from(this.platform.ready())
            .pipe(
                mergeMap(() => this.sqlite.create({name: dbName, location: 'default'})),
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
                () => {},
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
        return this.executeQuery(`CREATE TABLE IF NOT EXISTS \`${table}\` (${attributesStr})`);
    }

    public resetTable(table: TableName): Observable<any> {
        return this.dropTable(table).pipe(mergeMap(() => this.createTable(table)));
    }
}
