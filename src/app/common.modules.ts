import {NgModule} from '@angular/core';
import {CommonModule as AngularCommonModule} from '@angular/common';

import {ReactiveFormsModule} from '@angular/forms';

import {PasswordButtonComponent} from '@app/components/password-button/password-button.component';
import {IonicModule} from '@ionic/angular';

@NgModule({
    declarations: [
        PasswordButtonComponent
    ],
    imports: [
        AngularCommonModule,
        ReactiveFormsModule,
        IonicModule,
    ],
    exports: [
        PasswordButtonComponent
    ]
})
export class CommonModules {
}
