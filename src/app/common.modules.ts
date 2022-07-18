import {NgModule} from '@angular/core';
import {CommonModule as AngularCommonModule} from '@angular/common';

import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {PasswordButtonComponent} from '@app/components/password-button/password-button.component';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    declarations: [
        PasswordButtonComponent
    ],
    imports: [
        AngularCommonModule,
        ReactiveFormsModule,
        IonicModule,
        FormsModule,
        HttpClientModule,
    ],
    exports: [
        PasswordButtonComponent
    ]
})
export class CommonModules {
}
