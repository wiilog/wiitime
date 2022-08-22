import {Component} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {PagePath} from '@app/services/nav/page-path.enum';
import {NavService} from '@app/services/nav/nav.service';
import {StorageService} from '@app/services/storage/storage.service';

@Component({
    selector: 'app-account-creation',
    templateUrl: './account-creation.page.html',
    styleUrls: ['./account-creation.page.scss'],
})
export class AccountCreationPage {

    public headerMode: HeaderMode = HeaderMode.ACCOUNT_CREATION_PAGE;

    public constructor(private storageService: StorageService,
                       private navService: NavService) {

    }

    public loadParameterMenu(): void {
        this.navService.setRoot(PagePath.HOME, {redirectToParams: true}); //Todo change to active mode page when created)
    }
}
