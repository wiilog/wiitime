import {Component, OnInit} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';

@Component({
    selector: 'app-account-creation',
    templateUrl: './account-creation.page.html',
    styleUrls: ['./account-creation.page.scss'],
})
export class AccountCreationPage implements OnInit {

    public headerMode: HeaderMode = HeaderMode.ACCOUNT_CREATION_PAGE;

    constructor() {
    }

    ngOnInit() {
    }

}
