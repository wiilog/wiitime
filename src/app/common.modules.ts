import {NgModule} from '@angular/core';
import {CommonModule as AngularCommonModule} from '@angular/common';

import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {PasswordButtonComponent} from '@app/components/password-button/password-button.component';
import {HttpClientModule} from '@angular/common/http';
import {HeaderComponent} from '@app/components/header/header.component';

@NgModule({
    declarations: [
        PasswordButtonComponent,
        HeaderComponent
    ],
    imports: [
        AngularCommonModule,
        ReactiveFormsModule,
        IonicModule,
        FormsModule,
        HttpClientModule,
    ],
    exports: [
        PasswordButtonComponent,
        HeaderComponent
    ]
})
export class CommonModules {
}
