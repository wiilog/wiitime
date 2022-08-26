import {Component} from '@angular/core';
import {from, of} from 'rxjs';
import {Platform} from '@ionic/angular';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {mergeMap} from 'rxjs/operators';
import {NavService} from '@app/services/nav/nav.service';
import {PagePath} from '@app/services/nav/page-path.enum';
import {BackgroundTaskService} from "@app/services/background-task.service";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {

    private isFirstApplicationLaunch = false;

    constructor(private platform: Platform,
                private storageService: StorageService,
                private sqliteService: SQLiteService,
                private backgroundTaskService: BackgroundTaskService,
                private navService: NavService) {
        this.initializeApp();
    }

    public initializeApp(): void {
        from(this.platform.ready()).pipe(
            mergeMap(() => this.storageService.getValue(StorageKeyEnum.ADMIN_USERNAME)),
            mergeMap((adminUsername) => {
                this.isFirstApplicationLaunch = adminUsername == null;
                return adminUsername ? of(null) : this.storageService.initStorage();
            }),
            mergeMap(() => this.sqliteService.initialiseDatabase(this.isFirstApplicationLaunch)),
            mergeMap(() => this.backgroundTaskService.startSynchronisationLoop()),
            mergeMap(() => {
                if (this.isFirstApplicationLaunch) {
                    return this.navService.setRoot(PagePath.ACCOUNT_CREATION);
                } else {
                    return this.navService.setRoot(PagePath.HOME); //TODO change to active mode page when created
                }
            }),
        ).subscribe(() => console.log('init over'));
    }
}
