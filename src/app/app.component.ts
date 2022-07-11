import {Component} from '@angular/core';
import {from, of} from 'rxjs';
import {Platform} from '@ionic/angular';
import {StorageService} from '@app/services/storage/storage-service';
import {flatMap} from 'rxjs/internal/operators';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {mergeMap, tap} from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {

    private requireDatabaseCreation = false;

    constructor(private platform: Platform,
                private storageService: StorageService,
                private sqliteService: SQLiteService) {
        this.initializeApp();
    }

    public initializeApp(): void {
        from(this.platform.ready()).
            pipe(
                mergeMap(() => this.storageService.getValue(StorageKeyEnum.ADMIN_USERNAME)),
                mergeMap( (adminUsername) => {
                    this.requireDatabaseCreation = adminUsername == null; //TODO is there a better way to achieve this ?
                    return adminUsername ? of() : this.storageService.initStorage();
                }),
                mergeMap(() => this.sqliteService.initialiseDatabase(this.requireDatabaseCreation)),
            ).subscribe(() => {
                console.log('initialisation complete');
        });
    }
}
