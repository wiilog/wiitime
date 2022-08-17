import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SettingsMenuPageRoutingModule} from './settings-menu-routing.module';

import {SettingsMenuPage} from './settings-menu.page';
import {CommonModules} from '@app/common.modules';
import {GlobalSettingsComponent} from '@app/components/settings-menu/global-settings/global-settings.component';
import {ClockingSettingsComponent} from '@app/components/settings-menu/clocking-settings/clocking-settings.component';
import {SftpSettingsComponent} from '@app/components/settings-menu/sftp-settings/sftp-settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SettingsMenuPageRoutingModule,
        CommonModules,
        ReactiveFormsModule,
    ],
    declarations: [SettingsMenuPage, GlobalSettingsComponent, ClockingSettingsComponent, SftpSettingsComponent]
})
export class SettingsMenuPageModule {
}
