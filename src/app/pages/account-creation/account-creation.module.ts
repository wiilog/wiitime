import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {AccountCreationPageRoutingModule} from './account-creation-routing.module';
import {AccountCreationPage} from './account-creation.page';

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
    exports: [
    ],
    declarations: [AccountCreationPage, AccountFormComponent]
})
export class AccountCreationPageModule {
}
