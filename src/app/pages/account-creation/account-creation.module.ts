import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {AccountCreationPageRoutingModule} from './account-creation-routing.module';
import {AccountCreationPage} from './account-creation.page';

import {HeaderComponent} from '@app/components/header/header.component';
import { AccountFormComponent} from '@app/components/account-form/account-form.component';
import {CommonModules} from '@app/common.modules';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AccountCreationPageRoutingModule,
        CommonModules,
        ReactiveFormsModule
    ],
    declarations: [AccountCreationPage, HeaderComponent, AccountFormComponent]
})
export class AccountCreationPageModule {
}
