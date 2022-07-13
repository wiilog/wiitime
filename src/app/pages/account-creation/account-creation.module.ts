import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {AccountCreationPageRoutingModule} from './account-creation-routing.module';
import {AccountCreationPage} from './account-creation.page';

import {HeaderComponent} from '@app/components/header/header.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AccountCreationPageRoutingModule
    ],
    declarations: [AccountCreationPage, HeaderComponent]
})
export class AccountCreationPageModule {
}
