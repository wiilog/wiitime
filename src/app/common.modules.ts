import {NgModule} from '@angular/core';
import {CommonModule as AngularCommonModule} from '@angular/common';

import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {PasswordButtonComponent} from '@app/components/password-button/password-button.component';
import {HeaderComponent} from '@app/components/header/header.component';
import {FooterComponent} from '@app/components/footer/footer.component';
import {TabComponent} from '@app/components/tab/tab.component';
import {FormButtonComponent} from '@app/components/form/form-button/form-button.component';
import {FormTextAreaComponent} from '@app/components/form/form-text-area/form-text-area.component';
import {FormActionableComponent} from '@app/components/form/form-actionable/form-actionable.component';
import {FormToggleComponent} from '@app/components/form/form-toggle/form-toggle.component';
import {FormRangeComponent} from '@app/components/form/form-range/form-range.component';
import {FormInputComponent} from '@app/components/form/form-input/form-input.component';
import {FormPasswordInputComponent} from '@app/components/form/form-password-input/form-password-input.component';
import {FormModalComponent} from '@app/modals/form-modal/form-modal.component';
import {PasswordCheckModalComponent} from '@app/modals/password-check-modal/password-check-modal.component';

@NgModule({
    declarations: [
        PasswordButtonComponent,
        HeaderComponent,
        FooterComponent,
        TabComponent,
        FormButtonComponent,
        FormTextAreaComponent,
        FormActionableComponent,
        FormToggleComponent,
        FormRangeComponent,
        FormInputComponent,
        FormPasswordInputComponent,
        FormModalComponent,
        PasswordCheckModalComponent,
    ],
    imports: [
        AngularCommonModule,
        ReactiveFormsModule,
        IonicModule,
        FormsModule,
    ],
    exports: [
        PasswordButtonComponent,
        HeaderComponent,
        FooterComponent,
        TabComponent,
        FormButtonComponent,
        FormTextAreaComponent,
        FormActionableComponent,
        FormToggleComponent,
        FormRangeComponent,
        FormInputComponent,
        FormPasswordInputComponent,
        FormModalComponent,
        PasswordCheckModalComponent,
    ]
})
export class CommonModules {
}
